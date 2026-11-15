import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode, ReferralRecord, ReferralStatus } from '../lib/types';

interface CaseworkerViewProps {
  lang: LanguageCode;
}

const STATUS_OPTIONS: Array<'All' | ReferralStatus> = [
  'All',
  'Received',
  'In Review',
  'Acknowledged (Demo)',
];

export function CaseworkerView({ lang }: CaseworkerViewProps) {
  const t = TRANSLATIONS[lang];
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReferralStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/referrals');
      if (!resp.ok) throw new Error('Failed to load referrals');
      const data = await resp.json();
      const rows: ReferralRecord[] = data.referrals ?? [];
      setReferrals(rows);
      if (rows.length > 0 && !rows.some((r) => r.id === selectedId)) {
        setSelectedId(rows[0].id);
      }
    } catch {
      setError('Could not load simulated referrals. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${r.referenceCode} ${r.targetCenterName} ${r.approvedSummary} ${r.approvedSubCity ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [referrals, statusFilter, searchQuery]);

  const activeReferral = useMemo(() => {
    return (
      filtered.find((r) => r.id === selectedId) ??
      filtered[0] ??
      null
    );
  }, [filtered, selectedId]);

  const handleStatusChange = async (id: string, nextStatus: ReferralStatus) => {
    setUpdatingId(id);
    try {
      const resp = await fetch(`/api/referrals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setReferrals((prev) =>
          prev.map((r) => (r.id === id ? data.referral : r))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[#0F3D3E]/12 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#B91C1C]">
            Demo / Simulated Helping-Center Dashboard · Synthetic Data Only
          </p>
          <h1 className="font-display text-3xl font-bold text-[#0F3D3E]">
            Caseworker Referral Inbox
          </h1>
          <p className="text-sm text-[#14202B]/80 max-w-2xl leading-relaxed">
            Caseworkers see strictly the information explicitly approved by the person seeking
            support—never unapproved raw descriptions, IP addresses, or hidden profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReferrals}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F3D3E]/20 bg-white text-sm font-semibold text-[#0F3D3E] hover:bg-[#DCE8E3]/50 self-start md:self-auto min-h-[42px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter referrals by status"
          className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/12"
        >
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap min-h-[36px] ${
                statusFilter === st
                  ? 'bg-[#0F3D3E] text-[#FAF6EF]'
                  : 'text-[#14202B]/80 hover:text-[#0F3D3E]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#0F3D3E]/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Search simulated referrals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference or sub-city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#0F3D3E]/20 bg-white text-sm text-[#14202B] min-h-[42px]"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#0F3D3E]/15 bg-white p-8 text-sm text-[#14202B]/75">
          Loading synthetic referrals...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-6 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#0F3D3E]/15 bg-white p-10 text-center space-y-2">
          <p className="font-display text-lg font-semibold text-[#0F3D3E]">
            No synthetic referrals match this filter
          </p>
          <p className="text-sm text-[#14202B]/75">
            Try clearing your search or status filter, or submit a new approved demo referral from Get Support.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Incoming Referrals List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map((item) => {
              const selected = activeReferral?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left rounded-2xl p-4 border transition-colors space-y-2 ${
                    selected
                      ? 'bg-white border-[#0F3D3E] ring-1 ring-[#0F3D3E]'
                      : 'bg-white/75 border-[#0F3D3E]/15 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono-tabular font-semibold text-[#0F3D3E]">
                      {item.referenceCode}
                    </span>
                    <span className="text-[#14202B]/70">
                      {item.status} · Demo/Simulated
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-[#14202B] line-clamp-1">
                    {item.targetCenterName}
                  </p>
                  <p className="text-xs text-[#14202B]/80 line-clamp-2 leading-relaxed">
                    {item.approvedSummary}
                  </p>
                  <p className="text-xs text-[#14202B]/65">
                    {item.approvedSubCity ?? 'Sub-city not shared'}
                    {item.urgencyFlagged ? ' · Urgency flagged' : ''}
                    {item.minorSafeguardingNoted ? ' · Minor safeguarding' : ''}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Referral Detail View (Strictly approved fields only) */}
          {activeReferral && (
            <div className="lg:col-span-7 rounded-2xl bg-white border border-[#0F3D3E]/18 p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#0F3D3E]/12 pb-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#14202B]/70">
                    Demo / Simulated Referral · Consent approved{' '}
                    <span className="font-mono-tabular">
                      {new Date(activeReferral.consentApprovedAt).toLocaleString()}
                    </span>
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
                    <span className="font-mono-tabular">{activeReferral.referenceCode}</span>
                  </h2>
                  <p className="text-sm font-medium text-[#14202B]">
                    Routed to: {activeReferral.targetCenterName}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="caseworker-status-select"
                    className="block text-xs font-semibold text-[#0F3D3E]"
                  >
                    Demo Status
                  </label>
                  <select
                    id="caseworker-status-select"
                    value={activeReferral.status}
                    disabled={updatingId === activeReferral.id}
                    onChange={(e) =>
                      handleStatusChange(
                        activeReferral.id,
                        e.target.value as ReferralStatus
                      )
                    }
                    className="rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF] px-3 py-2 text-xs font-semibold text-[#0F3D3E] min-h-[40px]"
                  >
                    <option value="Received">Received</option>
                    <option value="In Review">In Review</option>
                    <option value="Acknowledged (Demo)">Acknowledged (Demo)</option>
                  </select>
                </div>
              </div>

              {/* Approved Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#0F3D3E]/75">
                  Person-Approved Referral Summary
                </h3>
                <div className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/12 p-4 text-sm text-[#14202B] leading-relaxed">
                  {activeReferral.approvedSummary}
                </div>
              </div>

              {/* Approved Needs & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-[#0F3D3E]/12 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-[#0F3D3E]">
                    Approved Support Categories
                  </p>
                  <p className="text-sm text-[#14202B]">
                    {activeReferral.approvedCategories.length > 0
                      ? activeReferral.approvedCategories
                          .map((c) => t.categories[c]?.label ?? c)
                          .join(' · ')
                      : 'None specified'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#0F3D3E]/12 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-[#0F3D3E]">
                    Shared Context Flags
                  </p>
                  <p className="text-sm text-[#14202B]">
                    Location: {activeReferral.approvedSubCity ?? 'Withheld by caller'}
                  </p>
                  <p className="text-sm text-[#14202B]">
                    Urgency note:{' '}
                    {activeReferral.urgencyFlagged
                      ? 'Flagged (requires human review)'
                      : 'Not flagged'}
                  </p>
                  {activeReferral.minorSafeguardingNoted && (
                    <p className="text-xs font-semibold text-[#B91C1C]">
                      Minor safeguarding protocol note included
                    </p>
                  )}
                </div>
              </div>

              {/* Matching Explanation */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#0F3D3E]/75">
                  Center Matching Explanation
                </h3>
                <ul className="list-disc pl-5 text-sm text-[#14202B]/85 space-y-1">
                  {activeReferral.matchingExplanation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[#DCE8E3]/55 border border-[#0F3D3E]/12 p-3.5 flex items-center gap-2.5 text-xs text-[#0F3D3E]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Data minimization check: Unapproved intake text and personal identifiers are
                  never stored or shown in this caseworker view.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
