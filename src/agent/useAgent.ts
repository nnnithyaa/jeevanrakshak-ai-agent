import { useState, useCallback } from 'react';
import type { BloodInventoryRow, AgentDecision, AgentState, ActivityItem } from '@/types';
import { inventoryData } from '@/data/simulatedData';
import { runAgentCycle, applyRecommendation } from '@/agent/agentEngine';

const initialInventory: BloodInventoryRow[] = inventoryData;

function buildInitialActivity(decision: AgentDecision): ActivityItem[] {
  const items: ActivityItem[] = [];
  const highRisks = decision.shortageRisks.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL');
  highRisks.slice(0, 2).forEach((s, i) => {
    items.push({
      id: `act-risk-${i}`,
      type: 'prediction',
      message: `Prediction generated: ${s.riskLevel} shortage forecast for ${s.bloodGroup} ${s.component} at ${s.centre}`,
      timestamp: 'Just now',
    });
  });
  decision.recommendations.slice(0, 2).forEach((r, i) => {
    items.push({
      id: `act-rec-${i}`,
      type: 'redistribution',
      message: `Redistribution recommended: ${r.recommendedQuantity} units ${r.bloodGroup} ${r.component} from ${r.sourceCentre} to ${r.destinationCentre}`,
      timestamp: 'Just now',
    });
  });
  items.push({
    id: 'act-inv-1',
    type: 'inventory',
    message: 'Inventory updated across all centres',
    timestamp: '5 min ago',
  });
  return items;
}

export function useAgent() {
  const [state, setState] = useState<AgentState>(() => {
    const decision = runAgentCycle(initialInventory);
    return {
      inventory: initialInventory,
      decision,
      cycleCount: 1,
    };
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const decision = runAgentCycle(initialInventory);
    return buildInitialActivity(decision);
  });

  const rerunCycle = useCallback(() => {
    setState((prev) => {
      const decision = runAgentCycle(prev.inventory);
      setActivities((prevActs) => [
        {
          id: `act-rerun-${Date.now()}`,
          type: 'prediction' as const,
          message: `Agent cycle #${prev.cycleCount + 1} completed — ${decision.recommendations.length} recommendations generated`,
          timestamp: 'Just now',
        },
        ...prevActs,
      ].slice(0, 8));
      return {
        ...prev,
        decision,
        cycleCount: prev.cycleCount + 1,
      };
    });
  }, []);

  const acceptRecommendation = useCallback((recId: string) => {
    setState((prev) => {
      if (!prev.decision) return prev;
      const rec = prev.decision.recommendations.find((r) => r.id === recId);
      if (!rec || rec.accepted) return prev;

      // SIMULATION ONLY — update simulated inventory state
      const updatedInventory = applyRecommendation(prev.inventory, rec);
      const newDecision = runAgentCycle(updatedInventory);

      setActivities((prevActs) => [
        {
          id: `act-accept-${Date.now()}`,
          type: 'redistribution' as const,
          message: `SIMULATION: Transfer accepted — ${rec.recommendedQuantity} units ${rec.bloodGroup} ${rec.component} from ${rec.sourceCentre} to ${rec.destinationCentre}`,
          timestamp: 'Just now',
        },
        ...prevActs,
      ].slice(0, 8));

      return {
        inventory: updatedInventory,
        decision: newDecision,
        cycleCount: prev.cycleCount + 1,
      };
    });
  }, []);

  const resetSimulation = useCallback(() => {
    const decision = runAgentCycle(initialInventory);
    setState({
      inventory: initialInventory,
      decision,
      cycleCount: 1,
    });
    setActivities(buildInitialActivity(decision));
  }, []);

  return {
    state,
    decision: state.decision,
    inventory: state.inventory,
    activities,
    cycleCount: state.cycleCount,
    rerunCycle,
    acceptRecommendation,
    resetSimulation,
  };
}
