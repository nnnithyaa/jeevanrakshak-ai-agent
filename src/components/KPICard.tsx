import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent: 'brand' | 'navy' | 'amber' | 'green';
}

const accentConfig = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-700', icon: 'text-brand-600' },
  navy: { bg: 'bg-navy-50', text: 'text-navy-700', icon: 'text-navy-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' },
  green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
};

export function KPICard({ label, value, icon: Icon, trend, trendUp, accent }: KPICardProps) {
  const cfg = accentConfig[accent];
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-navy-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-navy-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${cfg.bg}`}>
          <Icon size={22} className={cfg.icon} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={trendUp ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
