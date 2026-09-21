import type { RiskLevel, Priority, ExpiryLevel } from '@/types';

const riskConfig: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
  LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'LOW' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'MEDIUM' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'HIGH' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'CRITICAL' },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = riskConfig[level];
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

const priorityConfig: Record<Priority, { bg: string; text: string; label: string }> = {
  LOW: { bg: 'bg-green-50', text: 'text-green-700', label: 'LOW' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'MEDIUM' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'HIGH' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', label: 'CRITICAL' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

const expiryConfig: Record<ExpiryLevel, { bg: string; text: string; dot: string; label: string }> = {
  Normal: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Normal' },
  'Near Expiry': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Near Expiry' },
  'Expiring Soon': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Expiring Soon' },
};

export function ExpiryBadge({ level }: { level: ExpiryLevel }) {
  const cfg = expiryConfig[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
