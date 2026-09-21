import { Brain, RefreshCw, Info, TrendingDown, Clock, Package, ArrowUpRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { RiskBadge, ExpiryBadge } from '@/components/AgentBadges';
import { useAgentContext } from '@/agent/AgentContext';
import type { RiskLevel } from '@/types';

const riskColor: Record<RiskLevel, string> = {
  LOW: '#16a34a',
  MEDIUM: '#d97706',
  HIGH: '#ea580c',
  CRITICAL: '#dc2626',
};

export function PredictionsPage() {
  const { decision, cycleCount, rerunCycle } = useAgentContext();

  if (!decision) return null;

  const chartData = decision.forecasts.map((f) => ({
    label: `${f.bloodGroup} ${f.component.split(' ')[0]}`,
    centre: f.centre,
    current: f.currentStock,
    predicted: f.totalPredictedDemand,
    projected: f.projectedStock,
    risk: decision.shortageRisks.find((s) => s.inventoryId === f.inventoryId)?.riskLevel || 'LOW',
  }));

  return (
    <div>
      <PageHeader
        title="AI Predictions"
        subtitle="Prototype demand prediction — simulated historical data"
        actions={
          <button onClick={rerunCycle} className="btn-ghost border border-gray-200">
            <RefreshCw size={16} />
            Re-run Agent Cycle
          </button>
        }
      />

      {/* Disclaimer */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          <strong>Academic Prototype.</strong> Predictions are generated from simulated consumption data using a weighted moving average.
          This is not a clinically validated system and does not connect to real hospitals or blood banks.
        </p>
      </div>

      {/* Agent Cycle Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Brain size={16} /> Agent Cycle
          </div>
          <p className="mt-1.5 text-2xl font-bold text-navy-900">#{cycleCount}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <TrendingDown size={16} /> Forecasts
          </div>
          <p className="mt-1.5 text-2xl font-bold text-navy-900">{decision.forecasts.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Clock size={16} /> Expiry Risks
          </div>
          <p className="mt-1.5 text-2xl font-bold text-navy-900">
            {decision.expiryRisks.filter((e) => e.level !== 'Normal').length}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Package size={16} /> Surplus Centres
          </div>
          <p className="mt-1.5 text-2xl font-bold text-navy-900">{decision.surpluses.length}</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-navy-900">Demand Forecast — Current vs Predicted</h2>
        <p className="mt-0.5 text-sm text-navy-500">3-day forecast horizon • Weighted moving average</p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="current" name="Current Stock" fill="#3a5a85" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" name="Predicted Demand (3d)" fill="#c9354c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="card mt-6 overflow-hidden">
        <h2 className="px-5 pt-5 text-base font-semibold text-navy-900">Detailed Forecasts</h2>
        <p className="px-5 pt-0.5 text-sm text-navy-500">Per-inventory demand prediction with shortage and expiry risk</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Centre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Blood Group</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Component</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Current Stock</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Predicted Daily</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">3-Day Demand</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Projected Stock</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Days Left</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Shortage Risk</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Expiry Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {decision.forecasts.map((f) => {
                const risk = decision.shortageRisks.find((s) => s.inventoryId === f.inventoryId);
                const expiry = decision.expiryRisks.find((e) => e.inventoryId === f.inventoryId);
                return (
                  <tr key={f.inventoryId} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-navy-900">{f.centre}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-navy-50 text-xs font-bold text-navy-700">
                        {f.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-navy-700">{f.component}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-navy-900">{f.currentStock}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-navy-600">{f.predictedDailyDemand}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-navy-600">{f.totalPredictedDemand}</td>
                    <td className={`px-5 py-3.5 text-right text-sm font-semibold ${f.projectedStock < 0 ? 'text-red-600' : 'text-navy-900'}`}>
                      {f.projectedStock}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-navy-600">
                      {f.daysUntilDepletion >= 999 ? '—' : `${f.daysUntilDepletion}d`}
                    </td>
                    <td className="px-5 py-3.5">{risk && <RiskBadge level={risk.riskLevel} />}</td>
                    <td className="px-5 py-3.5">{expiry && <ExpiryBadge level={expiry.level} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Surplus Detection */}
      <div className="card mt-6 p-5">
        <h2 className="text-base font-semibold text-navy-900">Surplus Detection</h2>
        <p className="mt-0.5 text-sm text-navy-500">Facilities with stock exceeding predicted requirement (potential source centres)</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decision.surpluses.length === 0 && (
            <p className="text-sm text-navy-400">No surplus stock detected.</p>
          )}
          {decision.surpluses.map((s) => (
            <div key={s.inventoryId} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy-900">{s.centre}</span>
                <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-navy-50 text-xs font-bold text-navy-700">
                  {s.bloodGroup}
                </span>
              </div>
              <p className="mt-1 text-xs text-navy-500">{s.component}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-navy-500">Surplus: <strong className="text-green-600">{s.surplus} units</strong></span>
                <span className="text-navy-400">Stock: {s.currentStock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="card mt-6 p-5">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-navy-500" />
          <h2 className="text-base font-semibold text-navy-900">Prediction Methodology</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm text-navy-600">
          <p><strong className="text-navy-700">Demand Forecast:</strong> Weighted moving average of daily consumption with a trend factor for high-usage items. Forecast horizon: 3 days.</p>
          <p><strong className="text-navy-700">Shortage Risk:</strong> Compares projected stock (current − predicted demand) against a safe threshold of 1.5× daily demand. Risk levels: LOW, MEDIUM, HIGH, CRITICAL.</p>
          <p><strong className="text-navy-700">Expiry Risk:</strong> Near Expiry ≤ 5 days, Expiring Soon ≤ 2 days. Based on simulated expiry dates.</p>
          <p><strong className="text-navy-700">Surplus:</strong> Stock remaining after subtracting predicted demand and safe threshold. Used to identify potential source centres for redistribution.</p>
        </div>
      </div>
    </div>
  );
}
