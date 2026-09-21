import { useState } from 'react';
import {
  Siren,
  MapPin,
  Droplet,
  Package,
  AlertTriangle,
  Check,
  X,
  Clock,
  Truck,
  TrendingUp,
  ShieldCheck,
  Info,
  Building2,
  Search,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PriorityBadge, ExpiryBadge } from '@/components/AgentBadges';
import { useAgentContext } from '@/agent/AgentContext';
import { evaluateEmergencyRequest } from '@/agent/emergencyEngine';
import type { EmergencyRequest, EmergencyResult, EmergencyUrgency } from '@/agent/emergencyEngine';
import type { BloodGroup, BloodComponent } from '@/types';
import { BLOOD_GROUPS, COMPONENTS } from '@/data/simulatedData';

const urgencyConfig: Record<EmergencyUrgency, { bg: string; text: string; border: string; label: string; sublabel: string }> = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', label: 'Critical', sublabel: 'Immediate attention required' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', label: 'High', sublabel: 'Urgent — respond promptly' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Medium', sublabel: 'Moderate urgency' },
};

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const selectClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const labelClass = 'mb-1.5 block text-sm font-medium text-navy-700';

export function EmergencyPage() {
  const { inventory } = useAgentContext();
  const [form, setForm] = useState({
    hospital: '',
    location: '',
    bloodGroup: '' as BloodGroup | '',
    component: '' as BloodComponent | '',
    quantity: '',
    urgency: '' as EmergencyUrgency | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EmergencyResult | null>(null);
  const [history, setHistory] = useState<{ request: EmergencyRequest; result: EmergencyResult }[]>([]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.hospital.trim()) e.hospital = 'Hospital name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.bloodGroup) e.bloodGroup = 'Blood group is required';
    if (!form.component) e.component = 'Component is required';
    const qty = parseInt(form.quantity, 10);
    if (!form.quantity || isNaN(qty) || qty <= 0) e.quantity = 'Enter a valid quantity (1 or more)';
    if (!form.urgency) e.urgency = 'Urgency level is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const request: EmergencyRequest = {
      id: `emr-${Date.now()}`,
      hospital: form.hospital.trim(),
      location: form.location.trim(),
      bloodGroup: form.bloodGroup as BloodGroup,
      component: form.component as BloodComponent,
      quantity: parseInt(form.quantity, 10),
      urgency: form.urgency as EmergencyUrgency,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const evalResult = evaluateEmergencyRequest(request, inventory);
    setResult(evalResult);
    setHistory((prev) => [{ request, result: evalResult }, ...prev].slice(0, 5));
  }

  function resetForm() {
    setForm({ hospital: '', location: '', bloodGroup: '', component: '', quantity: '', urgency: '' });
    setErrors({});
    setResult(null);
  }

  return (
    <div>
      <PageHeader
        title="Emergency Mode"
        subtitle="Rapid AI-based blood source selection for critical situations"
      />

      {/* Simulation Disclaimer */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          <strong>Simulation Mode</strong> — This module demonstrates AI-based emergency source selection using simulated data.
          It does not connect to real hospitals, blood banks, patients, or donors. Human authorization is required for any real-world action.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ── Left: Request Form ── */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Siren size={18} className="text-brand-700" />
              <h2 className="text-base font-semibold text-navy-900">Emergency Request</h2>
            </div>
            <p className="mt-0.5 text-sm text-navy-500">Submit a simulated emergency blood request</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Hospital */}
              <div>
                <label className={labelClass}>Hospital / Facility Name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. City General Hospital"
                  />
                </div>
                {errors.hospital && <p className="mt-1 text-xs text-red-600">{errors.hospital}</p>}
              </div>

              {/* Location */}
              <div>
                <label className={labelClass}>Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. City General, Riverside"
                  />
                </div>
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
              </div>

              {/* Blood Group + Component */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value as BloodGroup })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.bloodGroup && <p className="mt-1 text-xs text-red-600">{errors.bloodGroup}</p>}
                </div>
                <div>
                  <label className={labelClass}>Component</label>
                  <select
                    value={form.component}
                    onChange={(e) => setForm({ ...form, component: e.target.value as BloodComponent })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    {COMPONENTS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.component && <p className="mt-1 text-xs text-red-600">{errors.component}</p>}
                </div>
              </div>

              {/* Quantity + Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Required Quantity</label>
                  <div className="relative">
                    <Droplet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. 7"
                    />
                  </div>
                  {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                </div>
                <div>
                  <label className={labelClass}>Urgency</label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value as EmergencyUrgency })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                  {errors.urgency && <p className="mt-1 text-xs text-red-600">{errors.urgency}</p>}
                </div>
              </div>

              {/* Urgency Preview */}
              {form.urgency && (
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${urgencyConfig[form.urgency].bg} ${urgencyConfig[form.urgency].border}`}>
                  <AlertTriangle size={16} className={urgencyConfig[form.urgency].text} />
                  <div>
                    <p className={`text-sm font-semibold ${urgencyConfig[form.urgency].text}`}>{urgencyConfig[form.urgency].label}</p>
                    <p className="text-xs text-navy-500">{urgencyConfig[form.urgency].sublabel}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">
                  <Search size={16} />
                  Evaluate Emergency Request
                </button>
                <button type="button" onClick={resetForm} className="btn-ghost border border-gray-200">
                  <RotateCcw size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-3">
          {!result && (
            <div className="card p-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50">
                  <Siren size={28} className="text-navy-400" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy-900">No emergency request submitted</h3>
                <p className="mt-1.5 max-w-sm text-sm text-navy-500">
                  Fill out the emergency request form and click "Evaluate Emergency Request" to see the AI agent's recommended source selection.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* No Suitable Source */}
              {!result.recommended && (
                <div className="card border-l-4 border-l-red-500 p-5">
                  <div className="flex items-center gap-2">
                    <X size={18} className="text-red-600" />
                    <h3 className="text-base font-semibold text-navy-900">No suitable simulated source</h3>
                  </div>
                  <p className="mt-2 text-sm text-navy-600">{result.reason}</p>
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Possible Next Actions</p>
                    <ul className="mt-2 space-y-2 text-sm text-navy-600">
                      <li className="flex items-start gap-2">
                        <ChevronRight size={14} className="mt-0.5 shrink-0 text-navy-400" />
                        Search nearby alternative centres outside the current network
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight size={14} className="mt-0.5 shrink-0 text-navy-400" />
                        Reduce requested quantity if appropriate for the simulation
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight size={14} className="mt-0.5 shrink-0 text-navy-400" />
                        Trigger simulated donor-pool availability check (no real donor contact)
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Recommended Source Card */}
              {result.recommended && (
                <div className={`card border-l-4 ${result.request.urgency === 'Critical' ? 'border-l-red-500' : result.request.urgency === 'High' ? 'border-l-orange-500' : 'border-l-amber-500'} overflow-hidden`}>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={18} className="text-green-600" />
                        <h3 className="text-base font-semibold text-navy-900">Recommended Source</h3>
                      </div>
                      <PriorityBadge priority={result.request.urgency === 'Critical' ? 'CRITICAL' : result.request.urgency === 'High' ? 'HIGH' : 'MEDIUM'} />
                    </div>

                    {/* Source name + blood info */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-lg font-bold text-navy-900">{result.recommended.centre}</span>
                      <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-navy-50 text-xs font-bold text-navy-700">
                        {result.request.bloodGroup}
                      </span>
                      <span className="text-sm text-navy-600">{result.request.component}</span>
                    </div>

                    {/* Key metrics grid */}
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <MetricField icon={<Droplet size={14} />} label="Available Stock" value={`${result.recommended.availableStock} units`} />
                      <MetricField icon={<Package size={14} />} label="Transferable" value={`${result.recommended.transferableQuantity} units`} />
                      <MetricField icon={<TrendingUp size={14} />} label="Utility Score" value={result.recommended.utility.toString()} />
                      <MetricField icon={<MapPin size={14} />} label="Distance" value={`${result.recommended.distanceKm} km`} />
                      <MetricField icon={<Truck size={14} />} label="Transport Time" value={`${result.recommended.transportMinutes} min`} />
                      <MetricField icon={<Clock size={14} />} label="Expiry" value={`${result.recommended.daysUntilExpiry} days`} />
                    </div>

                    {/* Fulfillment status */}
                    <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 ${result.fulfilled ? 'bg-green-50' : 'bg-amber-50'}`}>
                      {result.fulfilled ? (
                        <>
                          <Check size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-700">Request can be fully fulfilled</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">Partial fulfillment only — {result.recommended.transferableQuantity} of {result.request.quantity} units available</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Why this source? */}
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-500">
                      <Info size={13} /> Why the agent selected this source
                    </div>
                    <p className="mt-2 text-sm text-navy-600">{result.reason}</p>

                    {/* Decision factors */}
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <FactorBar label="Availability" value={result.recommended.factors.availability} />
                      <FactorBar label="Surplus" value={Math.min(1, result.recommended.factors.surplus / 30)} displayValue={`${result.recommended.factors.surplus} u`} />
                      <FactorBar label="Distance" value={result.recommended.factors.distance} />
                      <FactorBar label="Transport" value={result.recommended.factors.transport} />
                      <FactorBar label="Expiry" value={result.recommended.factors.expiry} />
                      <FactorBar label="Urgency" value={result.recommended.factors.urgency} />
                    </div>
                  </div>
                </div>
              )}

              {/* Alternative Sources Table */}
              {result.candidates.length > 1 && (
                <div className="card overflow-hidden">
                  <div className="px-5 pt-5">
                    <h3 className="text-base font-semibold text-navy-900">Alternative Sources</h3>
                    <p className="mt-0.5 text-sm text-navy-500">Other centres evaluated for this request</p>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Source</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Available</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Distance</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Transport</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Expiry</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Utility</th>
                          <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.candidates.map((c) => (
                          <tr key={c.centreId} className={c.recommended ? 'bg-brand-50/50' : 'transition-colors hover:bg-gray-50'}>
                            <td className="px-5 py-3 text-sm font-semibold text-navy-900">{c.centre}</td>
                            <td className="px-5 py-3 text-right text-sm text-navy-600">{c.availableStock} u</td>
                            <td className="px-5 py-3 text-right text-sm text-navy-600">{c.distanceKm} km</td>
                            <td className="px-5 py-3 text-right text-sm text-navy-600">{c.transportMinutes} min</td>
                            <td className="px-5 py-3 text-right"><ExpiryBadge level={c.expiryLevel} /></td>
                            <td className="px-5 py-3 text-right text-sm font-semibold text-navy-700">{c.utility}</td>
                            <td className="px-5 py-3 text-center">
                              {c.recommended ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                                  <Check size={12} /> Recommended
                                </span>
                              ) : (
                                <span className="text-xs text-navy-400">Alternative</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Request History ── */}
      {history.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="px-5 pt-5">
            <h3 className="text-base font-semibold text-navy-900">Recent Emergency Requests</h3>
            <p className="mt-0.5 text-sm text-navy-500">Session-based simulated request log</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Time</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Hospital</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Blood Group</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Component</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Qty</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Urgency</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(({ request, result: res }) => (
                  <tr key={request.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-navy-600">{request.timestamp}</td>
                    <td className="px-5 py-3 text-sm font-medium text-navy-900">{request.hospital}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-navy-50 text-xs font-bold text-navy-700">
                        {request.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-navy-600">{request.component}</td>
                    <td className="px-5 py-3 text-right text-sm text-navy-600">{request.quantity}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${urgencyConfig[request.urgency].bg} ${urgencyConfig[request.urgency].text}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {res.recommended ? (
                        <span className="text-green-600 font-medium">
                          {res.fulfilled ? 'Fulfilled' : 'Partial'} — {res.recommended.centre}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">No source available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function MetricField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-navy-400">
        {icon} {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}

function FactorBar({ label, value, displayValue }: { label: string; value: number; displayValue?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-navy-500">{label}</span>
        <span className="font-semibold text-navy-700">{displayValue || pct.toFixed(0)}{displayValue ? '' : '%'}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
