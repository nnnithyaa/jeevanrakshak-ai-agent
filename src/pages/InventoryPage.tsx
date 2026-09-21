import { useState, useMemo } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { inventoryData, CENTRES, BLOOD_GROUPS, COMPONENTS } from '@/data/simulatedData';
import type { BloodGroup, BloodComponent, StockStatus } from '@/types';

const STATUSES: StockStatus[] = ['Adequate', 'Low', 'Critical', 'Near Expiry'];

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [filterCentre, setFilterCentre] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return inventoryData.filter((row) => {
      if (search) {
        const q = search.toLowerCase();
        if (!row.centre.toLowerCase().includes(q) && !row.bloodGroup.toLowerCase().includes(q) && !row.component.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filterGroup !== 'all' && row.bloodGroup !== filterGroup) return false;
      if (filterComponent !== 'all' && row.component !== filterComponent) return false;
      if (filterCentre !== 'all' && row.centreId !== filterCentre) return false;
      if (filterStatus !== 'all' && row.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterGroup, filterComponent, filterCentre, filterStatus]);

  const selectClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

  return (
    <div>
      <PageHeader
        title="Blood Inventory"
        subtitle="Search and filter blood stock across all centres."
        actions={
          <button className="btn-ghost border border-gray-200">
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by centre, blood group, or component..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-navy-400" />
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className={selectClass}>
              <option value="all">All Groups</option>
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={filterComponent} onChange={(e) => setFilterComponent(e.target.value)} className={selectClass}>
              <option value="all">All Components</option>
              {COMPONENTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterCentre} onChange={(e) => setFilterCentre(e.target.value)} className={selectClass}>
              <option value="all">All Centres</option>
              {CENTRES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Centre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Blood Group</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Component</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Current Stock</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Daily Consumption</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Expiry Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-navy-900">{row.centre}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-navy-50 text-xs font-bold text-navy-700">
                      {row.bloodGroup}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-navy-700">{row.component}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold text-navy-900">{row.currentStock}</td>
                  <td className="px-5 py-3.5 text-right text-sm text-navy-600">{row.dailyConsumption}/day</td>
                  <td className="px-5 py-3.5 text-sm text-navy-600">{row.expiryDate}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-navy-400">
            No inventory items match your filters.
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-sm text-navy-500">
            Showing <strong className="text-navy-700">{filtered.length}</strong> of {inventoryData.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
