import { useMemo, useState } from 'react';
import { AlertTriangle, Brain, FlaskConical, Info, RefreshCw, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { RiskBadge } from '@/components/AgentBadges';
import { useAgentContext } from '@/agent/AgentContext';

const SCENARIOS = [10, 20, 30, 50];

export function SimulationPage() {
  const { decision, rerunCycle } = useAgentContext();
  const [increase, setIncrease] = useState(20);

  const result = useMemo(() => {
    if (!decision) return null;

    const multiplier = 1 + increase / 100;

    const rows = decision.forecasts.map((f) => {
      const simulatedDaily = Math.round(f.predictedDailyDemand * multiplier * 10) / 10;
      const simulatedDemand = Math.ceil(simulatedDaily * f.forecastHorizonDays);
      const simulatedProjected = f.currentStock - simulatedDemand;
      const safeStock = Math.ceil(simulatedDaily * 1.5);
      const shortfall = Math.max(0, simulatedDemand + safeStock - f.currentStock);

      let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      const days = simulatedDaily > 0 ? f.currentStock / simulatedDaily : 999;
      if (days <= 1) risk = 'CRITICAL';
      else if (days <= f.forecastHorizonDays) risk = 'HIGH';
      else if (shortfall > 0 || simulatedProjected < safeStock) risk = 'MEDIUM';
      else risk = 'LOW';

      return {
        ...f,
        simulatedDaily,
        simulatedDemand,
        simulatedProjected,
        shortfall,
        risk,
      };
    });

    const affected = rows.filter((r) => r.risk !== 'LOW');
    const critical = rows.filter((r) => r.risk === 'CRITICAL');

    const byGroup = new Map<string, { group: string; component: string; shortage: number }>();
    affected
      .filter((r) => r.shortfall > 0)
      .forEach((r) => {
        const key = `${r.bloodGroup}-${r.component}`;
        const existing = byGroup.get(key);
        byGroup.set(key, {
          group: r.bloodGroup,
          component: r.component,
          shortage: (existing?.shortage ?? 0) + r.shortfall,
        });
      });

    const preventive = Array.from(byGroup.values())
      .sort((a, b) => b.shortage - a.shortage)
      .slice(0, 5);

    const chartData = [
      {
        label: 'Current',
        demand: Math.round(decision.forecasts.reduce((sum, f) => sum + f.totalPredictedDemand, 0)),
        affected: decision.shortageRisks.filter((s) => s.riskLevel !== 'LOW').length,
      },
      {
        label: `+${increase}%`,
        demand: Math.round(rows.reduce((sum, r) => sum + r.simulatedDemand, 0)),
        affected: affected.length,
      },
    ];

    return { rows, affected, critical, preventive, chartData };
  }, [decision, increase]);

  if (!decision || !result) return null;

  return (
    <div>
      <PageHeader
        title="What-If Simulation"
        subtitle="Model demand scenarios and observe how the intelligent agent responds."
        actions={
          <button onClick={rerunCycle} className="btn-ghost border border-gray-200">
            <RefreshCw size={16} />
            Reset Agent Data
          </button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          <strong>Simulation Mode.</strong> This demonstrates how the intelligent agent responds when demand changes.
          Results use simulated data and are not clinical predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <FlaskConical size={19} className="text-brand-600" />
            <h2 className="text-base font-semibold text-navy-900">Demand Scenario</h2>
          </div>
          <p className="mt-1 text-sm text-navy-500">
            Increase predicted demand and let the agent recalculate risk.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {SCENARIOS.map((value) => (
              <button
                key={value}
                onClick={() => setIncrease(value)}
                className={`rounded-lg border px-4 py-4 text-left transition ${
                  increase === value
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="text-xl font-bold text-navy-900">+{value}%</p>
                <p className="mt-1 text-xs text-navy-500">Demand increase</p>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-navy-800">
              <Brain size={16} />
              Agent response
            </div>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              The agent recalculates predicted demand, projected stock and shortage risk for every inventory item,
              then identifies the blood groups that may need preventive redistribution.
            </p>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={19} className="text-brand-600" />
            <h2 className="text-base font-semibold text-navy-900">Scenario Impact</h2>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="demand" name="Predicted Demand" fill="#c9354c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="affected" name="Affected Inventory Items" fill="#3a5a85" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-sm text-navy-500">Demand Increase</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">+{increase}%</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-navy-500">Affected Items</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{result.affected.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-navy-500">Critical Items</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{result.critical.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-navy-500">Preventive Actions</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{result.preventive.length}</p>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h2 className="text-base font-semibold text-navy-900">Affected Inventory</h2>
            <p className="mt-0.5 text-sm text-navy-500">How the selected scenario changes shortage risk.</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Centre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Blood / Component</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Current</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Simulated Demand</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Projected Stock</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Shortfall</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.affected.slice(0, 12).map((r) => (
                <tr key={r.inventoryId} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-navy-900">{r.centre}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-700">
                    <span className="font-semibold">{r.bloodGroup}</span> · {r.component}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-navy-700">{r.currentStock}</td>
                  <td className="px-5 py-3.5 text-right text-sm text-navy-700">{r.simulatedDemand}</td>
                  <td className={`px-5 py-3.5 text-right text-sm font-semibold ${r.simulatedProjected < 0 ? 'text-red-600' : 'text-navy-900'}`}>
                    {r.simulatedProjected}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold text-red-600">{r.shortfall}</td>
                  <td className="px-5 py-3.5"><RiskBadge level={r.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600" />
          <h2 className="text-base font-semibold text-navy-900">Preventive Redistribution Opportunities</h2>
        </div>
        <p className="mt-1 text-sm text-navy-500">
          Blood groups/components with the largest simulated shortfalls should be reviewed first.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {result.preventive.length === 0 ? (
            <p className="text-sm text-navy-400">No simulated shortfalls detected for this scenario.</p>
          ) : (
            result.preventive.map((item) => (
              <div key={`${item.group}-${item.component}`} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-7 min-w-9 items-center justify-center rounded-md bg-navy-50 px-2 text-xs font-bold text-navy-700">
                    {item.group}
                  </span>
                  <span className="text-sm font-semibold text-red-600">{item.shortage} units</span>
                </div>
                <p className="mt-2 text-sm text-navy-700">{item.component}</p>
                <p className="mt-1 text-xs text-navy-500">Candidate for preventive redistribution review.</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
