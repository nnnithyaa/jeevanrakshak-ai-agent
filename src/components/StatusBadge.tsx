import type { StockStatus, AlertSeverity } from '@/types';

const statusConfig: Record<StockStatus, { label: string; bg: string; text: string; dot: string }> = {
  Adequate: { label: 'Adequate', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Low: { label: 'Low', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'Near Expiry': { label: 'Near Expiry', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export function StatusBadge({ status }: { status: StockStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const severityConfig: Record<AlertSeverity, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  warning: { label: 'Warning', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  info: { label: 'Info', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const cfg = severityConfig[severity];
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}
