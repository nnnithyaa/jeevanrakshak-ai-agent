import { AlertTriangle, RefreshCw, Info, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RiskBadge } from '@/components/AgentBadges';
import { useAgentContext } from '@/agent/AgentContext';
import { useState } from 'react';
import type { RiskLevel } from '@/types';

const riskOrder: Record<RiskLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const riskAccent: Record<RiskLevel, string> = {
  CRITICAL: 'border-l-red-500',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-green-500',
};

export function ShortagePage() {
  const { decision, rerunCycle } = useAgentContext();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!decision) return null;

  const sortedRisks = [...decision.shortageRisks]
    .filter((s) => s.riskLevel !== 'LOW')
    .sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

  const criticalCount = decision.shortageRisks.filter((s) => s.riskLevel === 'CRITICAL').length;
  const highCount = decision.shortageRisks.filter((s) => s.riskLevel === 'HIGH').length;
  const mediumCount = decision.shortageRisks.filter((s) => s.riskLevel === 'MEDIUM').length;

  return (
    <div>
      <PageHeader
        title="Shortage Alerts"
        subtitle="Agent-detected shortage risks based on predicted demand vs current stock"
        actions={
          <button onClick={rerunCycle} className="btn-ghost border border-gray-200">
            <RefreshCw size={16} />
            Re-run Agent Cycle
          </button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          <strong>Academic Prototype.</strong> Shortage risks are derived from simulated inventory and prototype demand prediction. No real hospital or blood bank data is used.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <AlertTriangle size={16} className="text-red-500" /> Critical
          </div>
          <p className="mt-1.5 text-3xl font-bold text-red-600">{criticalCount}</p>
          <p className="mt-0.5 text-xs text-navy-400">Stock depletes within 1 day</p>
        </div>
        <div className="card p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <AlertTriangle size={16} className="text-orange-500" /> High Risk
          </div>
          <p className="mt-1.5 text-3xl font-bold text-orange-600">{highCount}</p>
          <p className="mt-0.5 text-xs text-navy-400">Shortage within 3-day forecast</p>
        </div>
        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <AlertTriangle size={16} className="text-amber-500" /> Medium Risk
          </div>
          <p className="mt-1.5 text-3xl font-bold text-amber-600">{mediumCount}</p>
          <p className="mt-0.5 text-xs text-navy-400">Below safe threshold projected</p>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {sortedRisks.length === 0 && (
          <div className="card p-8 text-center text-sm text-navy-400">
            No shortage risks detected. All inventory levels are adequate.
          </div>
        )}
        {sortedRisks.map((risk) => {
          const isExpanded = expanded === risk.inventoryId;
          const rec = decision.recommendations.find(
            (r) => r.destinationCentreId === risk.centreId &&
                   r.bloodGroup === risk.bloodGroup &&
                   r.component === risk.component,
          );
          return (
            <div
              key={risk.inventoryId}
              className={`card border-l-4 ${riskAccent[risk.riskLevel]} overflow-hidden`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : risk.inventoryId)}
                className="flex w-full items-start gap-4 p-5 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <RiskBadge level={risk.riskLevel} />
                    <span className="text-sm font-semibold text-navy-900">
                      {risk.centre} — {risk.bloodGroup} {risk.component}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-navy-600">{risk.explanation}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-400">
                    <span>Current Stock: <strong className="text-navy-600">{risk.currentStock}</strong></span>
                    <span>Predicted Demand (3d): <strong className="text-navy-600">{risk.predictedDemand}</strong></span>
                    <span>Shortfall: <strong className="text-red-600">{risk.shortfall} units</strong></span>
                    {risk.predictedShortageDate && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Predicted shortage: <strong className="text-navy-600">{risk.predictedShortageDate}</strong>
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-navy-400" /> : <ChevronDown size={20} className="text-navy-400" />}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <h4 className="text-sm font-semibold text-navy-900">Recommended Preventive Action</h4>
                  {rec ? (
                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                        <MapPin size={16} className="text-brand-600" />
                        {rec.sourceCentre} → {rec.destinationCentre}
                      </div>
                      <p className="mt-1.5 text-sm text-navy-600">
                        Transfer <strong>{rec.recommendedQuantity} units</strong> of {rec.bloodGroup} {rec.component}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                        <span>Distance: {rec.distanceKm} km</span>
                        <span>Transport: {rec.transportMinutes} min</span>
                        <span>Priority: {rec.priority}</span>
                        <span>Utility: {rec.utility}</span>
                      </div>
                      <p className="mt-2 text-sm text-navy-600">{rec.reason}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-navy-400">
                      No automated redistribution available. Consider emergency donor outreach or external supply.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
