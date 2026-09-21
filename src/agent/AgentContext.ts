import { createContext, useContext } from 'react';
import type { AgentDecision, BloodInventoryRow, ActivityItem } from '@/types';

interface AgentContextValue {
  decision: AgentDecision | null;
  inventory: BloodInventoryRow[];
  activities: ActivityItem[];
  cycleCount: number;
  rerunCycle: () => void;
  acceptRecommendation: (recId: string) => void;
  resetSimulation: () => void;
}

export const AgentContext = createContext<AgentContextValue | null>(null);

export function useAgentContext(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useAgentContext must be used within AgentProvider');
  }
  return ctx;
}
