import type { ReactNode } from 'react';

interface PlaceholderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PlaceholderPage({ icon, title, description }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-500">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-navy-500">{description}</p>
      <span className="mt-5 inline-flex items-center rounded-md bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-600">
        Coming soon — AI agent module in development
      </span>
    </div>
  );
}
