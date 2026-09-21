import {
  Droplet,
  AlertCircle,
  Clock,
  TrendingDown,
  ChevronRight,
  Package,
  Brain,
  ArrowLeftRight,
  Siren,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { KPICard } from '@/components/KPICard';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { useAgentContext } from '@/agent/AgentContext';
import { bloodAvailability, demandTrend } from '@/data/simulatedData';
import type { StockStatus, AlertSeverity, AIAlert } from '@/types';

const statusColor: Record<StockStatus, string> = {
  Adequate: 'bg-green-500',
  Low: 'bg-amber-500',
  Critical: 'bg-red-500',
  'Near Expiry': 'bg-purple-500',
};

const activityIcon = {
  inventory: { icon: Package, color: 'text-navy-600 bg-navy-50' },
  prediction: { icon: Brain, color: 'text-brand-600 bg-brand-50' },
  redistribution: { icon: ArrowLeftRight, color: 'text-blue-600 bg-blue-50' },
  emergency: { icon: Siren, color: 'text-red-600 bg-red-50' },
};

export function DashboardPage() {
  const { decision, activities } = useAgentContext();

  if (!decision) return null;

  // Derive KPIs from agent decision
  const totalUnits = decision.forecasts.reduce((sum, f) => sum + f.currentStock, 0);
  const criticalStock = decision.shortageRisks.filter((s) => s.riskLevel === 'CRITICAL').length;
  const nearExpiryUnits = decision.expiryRisks
    .filter((e) => e.level !== 'Normal')
    .reduce((sum, e) => sum + e.currentStock, 0);
  const predictedShortages = decision.shortageRisks.filter(
    (s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL',
  ).length;

  // Derive AI Alerts from agent decision
  const aiAlerts: AIAlert[] = [];

  // Critical/High shortage risks → alerts
  decision.shortageRisks
    .filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH')
    .slice(0, 3)
    .forEach((s) => {
      const severity: AlertSeverity = s.riskLevel === 'CRITICAL' ? 'critical' : 'warning';
      aiAlerts.push({
        id: `alert-risk-${s.inventoryId}`,
        severity,
        title: `${s.riskLevel.charAt(0) + s.riskLevel.slice(1).toLowerCase()} shortage risk for ${s.bloodGroup} ${s.component} at ${s.centre}`,
        bloodGroup: s.bloodGroup,
        component: s.component,
        centre: s.centre,
        description: s.explanation,
        timestamp: 'Just now',
      });
    });

  // Expiry alerts
  decision.expiryRisks
    .filter((e) => e.level !== 'Normal')
    .slice(0, 2)
    .forEach((e) => {
      aiAlerts.push({
        id: `alert-expiry-${e.inventoryId}`,
        severity: e.level === 'Expiring Soon' ? 'critical' : 'warning',
        title: `${e.currentStock} ${e.component.toLowerCase()} units ${e.level.toLowerCase()} at ${e.centre}`,
        bloodGroup: e.bloodGroup,
        component: e.component,
        centre: e.centre,
        description: `${e.bloodGroup} ${e.component} at ${e.centre} expires in ${e.daysUntilExpiry} days. Redistribution recommended to prevent wastage.`,
        timestamp: 'Just now',
      });
    });

  // Info alert for recommendations
  if (decision.recommendations.length > 0) {
    const rec = decision.recommendations[0];
    aiAlerts.push({
      id: 'alert-rec-1',
      severity: 'info',
      title: `Redistribution available: ${rec.recommendedQuantity} units ${rec.bloodGroup} ${rec.component} from ${rec.sourceCentre}`,
      bloodGroup: rec.bloodGroup,
      component: rec.component,
      centre: rec.destinationCentre,
      description: `The AI agent recommends transferring ${rec.recommendedQuantity} units from ${rec.sourceCentre} to ${rec.destinationCentre} (${rec.distanceKm} km, ${rec.transportMinutes} min transport).`,
      timestamp: 'Just now',
    });
  }

  return (
    <div>
      <PageHeader
        title="Good evening, Admin"
        subtitle="Here's the current blood supply overview."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Units" value={totalUnits} icon={Droplet} accent="brand" trend="Across all centres" trendUp />
        <KPICard label="Critical Stock" value={criticalStock} icon={AlertCircle} accent="amber" trend="Items at critical level" />
        <KPICard label="Near-Expiry Units" value={nearExpiryUnits} icon={Clock} accent="navy" trend="Within 5 days" />
        <KPICard label="Predicted Shortages" value={predictedShortages} icon={TrendingDown} accent="green" trend="Next 3 days" />
      </div>

      {/* Blood Availability + Demand Trend */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Blood Availability */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="text-base font-semibold text-navy-900">Blood Availability</h2>
          <p className="mt-0.5 text-sm text-navy-500">Current stock by blood group</p>
          <div className="mt-4 space-y-2.5">
            {bloodAvailability.map((item) => {
              const pct = Math.round((item.currentStock / item.capacity) * 100);
              return (
                <div key={item.bloodGroup} className="flex items-center gap-3">
                  <div className="flex h-9 w-12 items-center justify-center rounded-md bg-navy-50 text-sm font-bold text-navy-700">
                    {item.bloodGroup}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-900">{item.currentStock} units</span>
                      <span className="text-xs text-navy-400">cap {item.capacity}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${statusColor[item.status]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demand Trend Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-navy-900">Demand Trend</h2>
          <p className="mt-0.5 text-sm text-navy-500">Blood demand over the last 7 days</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOpos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9354c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9354c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3a5a85" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3a5a85" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBpos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorABpos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOneg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Area type="monotone" dataKey="O_pos" name="O+" stroke="#c9354c" fill="url(#colorOpos)" strokeWidth={2} />
                <Area type="monotone" dataKey="A_pos" name="A+" stroke="#3a5a85" fill="url(#colorApos)" strokeWidth={2} />
                <Area type="monotone" dataKey="B_pos" name="B+" stroke="#16a34a" fill="url(#colorBpos)" strokeWidth={2} />
                <Area type="monotone" dataKey="AB_pos" name="AB+" stroke="#7c3aed" fill="url(#colorABpos)" strokeWidth={2} />
                <Area type="monotone" dataKey="O_neg" name="O-" stroke="#d97706" fill="url(#colorOneg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Alerts + Recent Activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* AI Alerts */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-navy-900">AI Alerts</h2>
              <p className="mt-0.5 text-sm text-navy-500">Predictive insights from the AI agent</p>
            </div>
            <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {aiAlerts.length} active
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {aiAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="mt-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-navy-400">{alert.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-navy-900">{alert.title}</p>
                  <p className="mt-1 text-sm text-navy-500">{alert.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-navy-400">
                    <span>Blood Group: <strong className="text-navy-600">{alert.bloodGroup}</strong></span>
                    <span>•</span>
                    <span>Component: <strong className="text-navy-600">{alert.component}</strong></span>
                    <span>•</span>
                    <span>Centre: <strong className="text-navy-600">{alert.centre}</strong></span>
                  </div>
                </div>
                <button className="btn-ghost shrink-0 text-brand-700 hover:bg-brand-50">
                  View Details
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-navy-900">Recent Activity</h2>
          <p className="mt-0.5 text-sm text-navy-500">System actions log</p>
          <div className="mt-4 space-y-4">
            {activities.map((activity) => {
              const cfg = activityIcon[activity.type];
              const Icon = cfg.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-navy-900">{activity.message}</p>
                    <p className="mt-0.5 text-xs text-navy-400">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
