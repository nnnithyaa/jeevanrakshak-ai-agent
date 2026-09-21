import {
  LayoutDashboard,
  Package,
  Brain,
  AlertTriangle,
  ArrowLeftRight,
  Siren,
  FlaskConical,
  LogOut,
  CircleDot,
} from 'lucide-react';
import type { PageId } from '@/types';
import { Logo } from './Logo';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
}

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Blood Inventory', icon: Package },
  { id: 'predictions', label: 'AI Predictions', icon: Brain },
  { id: 'shortage', label: 'Shortage Alerts', icon: AlertTriangle },
  { id: 'redistribution', label: 'Smart Redistribution', icon: ArrowLeftRight },
  { id: 'emergency', label: 'Emergency Mode', icon: Siren },
  { id: 'simulation', label: 'What-If Simulation', icon: FlaskConical },
];

export function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col bg-navy-900 text-white">
      <div className="flex items-center px-5 py-5">
        <div className="scale-90 origin-left">
          <Logo size="md" />
        </div>
      </div>

      <div className="h-px bg-navy-800" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-link w-full ${active ? 'sidebar-link-active' : ''}`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-navy-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="h-px bg-navy-800" />

      <div className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-white">Admin</div>
            <div className="flex items-center gap-1.5 text-xs text-navy-400">
              <CircleDot size={10} className="text-green-400" fill="currentColor" />
              Online
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="sidebar-link mt-2 w-full"
        >
          <LogOut size={18} className="text-navy-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}
