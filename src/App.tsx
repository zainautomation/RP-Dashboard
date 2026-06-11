import { useState, useMemo } from 'react';
import { campaigns, type Campaign } from './data/campaigns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, Legend,
} from 'recharts';
import './index.css';

const fmt = (n: number) => (n * 100).toFixed(1) + '%';
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{sub}</p>}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = { active: '#22c55e', inactive: '#94a3b8' };

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: active ? '#dcfce7' : '#f1f5f9',
      color: active ? '#15803d' : '#64748b',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[active ? 'active' : 'inactive'], display: 'inline-block' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

const TYPE_COLOR: Record<Campaign['type'], string> = { EOR: '#6366f1', COR: '#f59e0b' };


function DetailPanel({ c, onClose }: { c: Campaign; onClose: () => void }) {
  const radialData = [
    { name: 'Open', value: Math.round(c.open_rate * 100), fill: '#6366f1' },
    { name: 'Click', value: Math.round(c.click_rate * 100), fill: '#f59e0b' },
    { name: 'Reply', value: Math.round(c.reply_rate * 100), fill: '#22c55e' },
    { name: 'Bounce', value: Math.round(c.bounce_rate * 100), fill: '#ef4444' },
  ];

  const barData = [
    { label: 'Delivered', value: c.unique_delivered },
    { label: 'Opened', value: c.unique_opened },
    { label: 'Clicked', value: c.unique_clicked },
    { label: 'Replied', value: c.unique_replied },
    { label: 'Bounced', value: c.unique_bounced },
    { label: 'Spam', value: c.unique_spam_blocked },
    { label: 'Unsub', value: c.unique_unsubscribed },
  ];
  const barColors = ['#6366f1', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#f97316', '#94a3b8'];

  return (
    <div style={{ background: 'white', borderLeft: '1px solid #e2e8f0', width: 380, flexShrink: 0, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0, lineHeight: 1.4 }}>{c.name}</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>&times;</button>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge active={c.active} />
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: TYPE_COLOR[c.type] + '22', color: TYPE_COLOR[c.type] }}>{c.type}</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.num_steps} steps</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Created', value: fmtDate(c.created_at) },
            { label: 'Last Used', value: fmtDate(c.last_used_at) },
            { label: 'Daily Limit', value: c.max_emails_per_day ? `${c.max_emails_per_day}/day` : 'Unlimited' },
            { label: 'Scheduled', value: typeof c.unique_scheduled === 'string' ? 'Loading…' : c.unique_scheduled },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px' }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Rate Overview</p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={radialData}>
                <RadialBar dataKey="value" label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right"
                  formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Contact Funnel</p>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 24, left: -10 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Email Rates</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Open Rate', value: c.open_rate, color: '#6366f1' },
              { label: 'Click Rate', value: c.click_rate, color: '#f59e0b' },
              { label: 'Reply Rate', value: c.reply_rate, color: '#22c55e' },
              { label: 'Bounce Rate', value: c.bounce_rate, color: '#ef4444' },
              { label: 'Hard Bounce', value: c.hard_bounce_rate, color: '#dc2626' },
              { label: 'Spam Block', value: c.spam_block_rate, color: '#f97316' },
              { label: 'Opt-Out', value: c.opt_out_rate, color: '#94a3b8' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', width: 90, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                  <div style={{ width: `${Math.min(value * 100, 100)}%`, background: color, height: 6, borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, width: 44, textAlign: 'right', color }}>{fmt(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [filter, setFilter] = useState<'ALL' | 'EOR' | 'COR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Campaign | null>(null);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (filter !== 'ALL' && c.type !== filter) return false;
      if (statusFilter === 'ACTIVE' && !c.active) return false;
      if (statusFilter === 'INACTIVE' && c.active) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, statusFilter, search]);

  const baseCampaigns = useMemo(() =>
    campaigns.filter((c) => filter === 'ALL' || c.type === filter), [filter]);

  const totals = useMemo(() => ({
    total: baseCampaigns.length,
    active: baseCampaigns.filter((c) => c.active).length,
    delivered: baseCampaigns.reduce((s, c) => s + c.unique_delivered, 0),
    opened: baseCampaigns.reduce((s, c) => s + c.unique_opened, 0),
    replied: baseCampaigns.reduce((s, c) => s + c.unique_replied, 0),
    clicked: baseCampaigns.reduce((s, c) => s + c.unique_clicked, 0),
  }), [baseCampaigns]);

  const withDeliveries = baseCampaigns.filter((c) => c.unique_delivered > 0);
  const avgOpenRate = withDeliveries.length ? withDeliveries.reduce((s, c) => s + c.open_rate, 0) / withDeliveries.length : 0;
  const avgReplyRate = withDeliveries.length ? withDeliveries.reduce((s, c) => s + c.reply_rate, 0) / withDeliveries.length : 0;

  const overviewBarData = baseCampaigns
    .filter((c) => c.unique_delivered > 0)
    .map((c) => ({
      name: c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name,
      Delivered: c.unique_delivered,
      Opened: c.unique_opened,
      Replied: c.unique_replied,
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Apollo Campaign Dashboard</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>EOR &amp; COR Sequences</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Last synced: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        </div>
      </header>

      {/* Filters */}
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 3, background: '#f1f5f9', borderRadius: 8, padding: 4 }}>
          {(['ALL', 'EOR', 'COR'] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '4px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: filter === t ? 'white' : 'transparent',
              color: filter === t ? (t === 'EOR' ? '#6366f1' : t === 'COR' ? '#f59e0b' : '#1e293b') : '#94a3b8',
              boxShadow: filter === t ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3, background: '#f1f5f9', borderRadius: 8, padding: 4 }}>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '4px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: statusFilter === s ? 'white' : 'transparent',
              color: statusFilter === s ? '#1e293b' : '#94a3b8',
              boxShadow: statusFilter === s ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}>{s.charAt(0) + s.slice(1).toLowerCase()}</button>
          ))}
        </div>
        <input
          type="text" placeholder="Search campaigns…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', width: 220, outline: 'none', color: '#334155' }}
        />
      </div>

      {/* Summary Cards */}
      <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        <StatCard label="Total" value={totals.total} />
        <StatCard label="Active" value={totals.active} sub={`${totals.total - totals.active} inactive`} />
        <StatCard label="Delivered" value={totals.delivered.toLocaleString()} />
        <StatCard label="Opened" value={totals.opened.toLocaleString()} sub={`Avg ${fmt(avgOpenRate)}`} />
        <StatCard label="Replied" value={totals.replied.toLocaleString()} sub={`Avg ${fmt(avgReplyRate)}`} />
        <StatCard label="Clicked" value={totals.clicked.toLocaleString()} />
      </div>

      {/* Overview Chart */}
      {overviewBarData.length > 0 && (
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>Email Volume by Campaign</p>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewBarData} margin={{ top: 0, right: 16, bottom: 28, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="Delivered" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Opened" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Replied" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, margin: '0 24px 24px', gap: 16, overflow: 'hidden' }}>
        <div style={{ flex: 1, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Campaign', 'Status', 'Steps', 'Scheduled', 'Delivered', 'Opened', 'Open %', 'Reply %', 'Bounce %', 'Last Used'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{ cursor: 'pointer', background: selected?.id === c.id ? '#eef2ff' : i % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #f8fafc' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: TYPE_COLOR[c.type] + '22', color: TYPE_COLOR[c.type], flexShrink: 0 }}>{c.type}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge active={c.active} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{c.num_steps}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{typeof c.unique_scheduled === 'string' ? '…' : c.unique_scheduled.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{c.unique_delivered.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{c.unique_opened.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, textAlign: 'right', color: c.open_rate > 0 ? '#2563eb' : '#94a3b8' }}>{fmt(c.open_rate)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, textAlign: 'right', color: c.reply_rate > 0 ? '#16a34a' : '#94a3b8' }}>{fmt(c.reply_rate)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, textAlign: 'right', color: c.bounce_rate > 0.1 ? '#dc2626' : c.bounce_rate > 0 ? '#f97316' : '#94a3b8' }}>{fmt(c.bounce_rate)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>{fmtDate(c.last_used_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No campaigns match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && <DetailPanel c={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
