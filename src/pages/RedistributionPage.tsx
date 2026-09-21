import { useState } from 'react';
import {
  ArrowLeftRight,
  RefreshCw,
  Info,
  MapPin,
  Truck,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Droplet,
  Clock,
  ShieldCheck,
  Package,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PriorityBadge, RiskBadge, ExpiryBadge } from '@/components/AgentBadges';
import { useAgentContext } from '@/agent/AgentContext';
import type { RedistributionRecommendation, AlternativeSource, Priority } from '@/types';

const priorityBorder: Record<Priority, string> = {
  LOW: 'border-l-green-500',
  MEDIUM: 'border-l-amber-500',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500',
};

const priorityAccent: Record<Priority, string> = {
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

export function RedistributionPage() {
  const { decision, acceptRecommendation, rerunCycle, resetSimulation } = useAgentContext();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!decision) return null;

  const recommendations = decision.recommendations;
  const sortedRecs = [...recommendations].sort((a, b) => b.utility - a.utility);

  return (
    <div>
      <PageHeader
        title="Smart Redistribution"
        subtitle="AI-recommended transfers to balance stock and reduce shortage risk"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={rerunCycle} className="btn-ghost border border-gray-200">
              <RefreshCw size={16} />
              Re-run Cycle
            </button>
            <button onClick={resetSimulation} className="btn-ghost border border-gray-200">
              <RotateCcw size={16} />
              Reset Simulation
            </button>
          </div>
        }
      />

      {/* Simulation Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          <strong>Simulation Mode</strong> — Recommendations are generated from simulated inventory and demand data.
          Human authorization is required before any real-world action.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={<ArrowLeftRight size={16} />}
          label="Recommendations"
          value={recommendations.length}
          valueClass="text-navy-900"
        />
        <SummaryCard
          icon={<AlertCircle size={16} className="text-red-500" />}
          label="Critical Priority"
          value={recommendations.filter((r) => r.priority === 'CRITICAL').length}
          valueClass="text-red-600"
        />
        <SummaryCard
          icon={<AlertCircle size={16} className="text-orange-500" />}
          label="High Priority"
          value={recommendations.filter((r) => r.priority === 'HIGH').length}
          valueClass="text-orange-600"
        />
        <SummaryCard
          icon={<Check size={16} className="text-green-500" />}
          label="Accepted"
          value={recommendations.filter((r) => r.accepted).length}
          valueClass="text-green-600"
        />
      </div>

      {/* Empty State */}
      {sortedRecs.length === 0 && (
        <div className="card p-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <Check size={28} className="text-green-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-navy-900">No redistribution required</h3>
            <p className="mt-1.5 max-w-md text-sm text-navy-500">
              The AI agent has analyzed all inventory across centres. Current stock levels are adequate
              and no immediate redistribution recommendations have been generated.
            </p>
            <button onClick={rerunCycle} className="btn-ghost mt-4 border border-gray-200">
              <RefreshCw size={16} />
              Re-run Agent Cycle
            </button>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {sortedRecs.map((rec, index) => {
          const isReviewing = reviewing === rec.id;
          const isExpanded = expanded === rec.id;
          return (
            <div
              key={rec.id}
              className={`card border-l-4 ${priorityBorder[rec.priority]} overflow-hidden`}
            >
              {/* ── Recommendation Header ── */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Top row: priority + route */}
                    <div className="flex items-center gap-3">
                      <PriorityBadge priority={rec.priority} />
                      {index === 0 && sortedRecs.length > 1 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          <Sparkles size={11} /> Top Priority
                        </span>
                      )}
                      <span className="text-sm font-semibold text-navy-900">
                        {rec.sourceCentre} <ArrowRight size={14} className="inline text-navy-400" /> {rec.destinationCentre}
                      </span>
                    </div>

                    {/* Key metrics row */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-navy-50 text-xs font-bold text-navy-700">
                          {rec.bloodGroup}
                        </span>
                        <span className="text-navy-600">{rec.component}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplet size={14} className="text-brand-600" />
                        <span className="font-semibold text-navy-900">{rec.recommendedQuantity} units</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-navy-500">
                        <MapPin size={14} /> {rec.distanceKm} km
                      </div>
                      <div className="flex items-center gap-1.5 text-navy-500">
                        <Truck size={14} /> {rec.transportMinutes} min
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-navy-400" />
                        <span className="text-navy-500">Utility: <strong className="text-navy-700">{rec.utility}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex shrink-0 items-center gap-2">
                    {rec.accepted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                        <Check size={14} /> Accepted (Simulated)
                      </span>
                    ) : (
                      <button
                        onClick={() => setReviewing(isReviewing ? null : rec.id)}
                        className="btn-primary text-xs"
                      >
                        Review Recommendation
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Decision Explanation ── */}
                <div className="mt-4 rounded-lg bg-navy-50 px-4 py-3">
                  <p className="text-sm text-navy-700">{rec.reason}</p>
                </div>

                {/* ── Factor Summary ── */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <FactorChip label="Shortage Severity" value={rec.factors.shortageRisk} accent={priorityAccent[rec.priority]} />
                  <FactorChip label="Shortage Urgency" value={rec.factors.shortageUrgency.toFixed(2)} />
                  <FactorChip label="Expiry Relevance" value={rec.factors.expiryRelevance.toFixed(2)} />
                  <FactorChip label="Source Surplus" value={`${rec.factors.sourceSurplus} units`} />
                  <FactorChip label="Proximity" value={rec.factors.proximity.toFixed(2)} />
                  <FactorChip label="Transport Delay" value={rec.factors.transportDelay.toFixed(2)} />
                </div>

                {/* ── Expand toggle ── */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : rec.id)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-700"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Source comparison & detailed factors
                </button>
              </div>

              {/* ── Expanded: Source Comparison + Detailed Factors ── */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  {/* Detailed Factor Grid */}
                  <h4 className="text-sm font-semibold text-navy-900">Decision Factors</h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <FactorCard label="Shortage Risk" value={rec.factors.shortageRisk} />
                    <FactorCard label="Shortage Urgency" value={rec.factors.shortageUrgency.toFixed(2)} />
                    <FactorCard label="Expiry Relevance" value={rec.factors.expiryRelevance.toFixed(2)} />
                    <FactorCard label="Source Surplus" value={`${rec.factors.sourceSurplus} u`} />
                    <FactorCard label="Proximity" value={rec.factors.proximity.toFixed(2)} />
                    <FactorCard label="Transport Delay" value={rec.factors.transportDelay.toFixed(2)} />
                  </div>

                  {/* Source Comparison Table */}
                  <h4 className="mt-5 text-sm font-semibold text-navy-900">Source Comparison</h4>
                  <p className="mt-0.5 text-xs text-navy-500">Recommended source highlighted alongside alternatives</p>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-white">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Source Centre</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Available Surplus</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Distance</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Transport Time</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Utility Score</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {/* Recommended source */}
                        <tr className="bg-brand-50/50">
                          <td className="px-4 py-3 text-sm font-semibold text-navy-900">
                            {rec.sourceCentre}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">{rec.factors.sourceSurplus} units</td>
                          <td className="px-4 py-3 text-right text-sm text-navy-700">{rec.distanceKm} km</td>
                          <td className="px-4 py-3 text-right text-sm text-navy-700">{rec.transportMinutes} min</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-brand-700">{rec.utility}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                              <Check size={12} /> Recommended
                            </span>
                          </td>
                        </tr>
                        {/* Alternative sources */}
                        {rec.alternatives.map((alt) => (
                          <tr key={alt.centreId} className="transition-colors hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-navy-700">{alt.centre}</td>
                            <td className="px-4 py-3 text-right text-sm text-navy-600">{alt.surplus} units</td>
                            <td className="px-4 py-3 text-right text-sm text-navy-600">{alt.distanceKm} km</td>
                            <td className="px-4 py-3 text-right text-sm text-navy-600">{alt.transportMinutes} min</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-navy-700">{alt.utility}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs text-navy-400">Alternative</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rec.alternatives.length === 0 && (
                    <p className="mt-2 text-xs text-navy-400">No alternative source centres available for this blood group and component.</p>
                  )}
                </div>
              )}

              {/* ── Review Panel ── */}
              {isReviewing && !rec.accepted && (
                <div className="border-t-2 border-brand-200 bg-navy-50 px-5 py-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-brand-700" />
                    <h4 className="text-sm font-semibold text-navy-900">Review Simulated Transfer</h4>
                  </div>

                  {/* Transfer Summary Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    <ReviewField icon={<Package size={14} />} label="Source" value={rec.sourceCentre} />
                    <ReviewField icon={<ArrowRight size={14} />} label="Destination" value={rec.destinationCentre} />
                    <ReviewField icon={<Droplet size={14} />} label="Blood Group" value={rec.bloodGroup} />
                    <ReviewField icon={<Package size={14} />} label="Component" value={rec.component} />
                    <ReviewField icon={<Droplet size={14} />} label="Quantity" value={`${rec.recommendedQuantity} units`} />
                    <ReviewField icon={<AlertCircle size={14} />} label="Priority" value={rec.priority} />
                    <ReviewField icon={<MapPin size={14} />} label="Distance" value={`${rec.distanceKm} km`} />
                    <ReviewField icon={<Clock size={14} />} label="Transport Time" value={`${rec.transportMinutes} min`} />
                  </div>

                  {/* Agent Reasoning */}
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-500">
                      <Info size={13} /> Agent Reasoning
                    </div>
                    <p className="mt-2 text-sm text-navy-600">{rec.reason}</p>
                  </div>

                  {/* Simulation disclaimer */}
                  <p className="mt-3 text-xs text-navy-400">
                    Accepting will only update the simulated inventory state and re-run the agent.
                    No real-world transfer is executed.
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setReviewing(null)}
                      className="btn-ghost border border-gray-300"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        acceptRecommendation(rec.id);
                        setReviewing(null);
                      }}
                      className="btn-primary"
                    >
                      <Check size={16} />
                      Accept Simulated Recommendation
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm text-navy-500">
        {icon} {label}
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function FactorChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${accent || 'bg-gray-100 text-navy-600'}`}>
      <span className="text-navy-400">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function FactorCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs text-navy-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}

function ReviewField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-navy-400">
        {icon} {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}
