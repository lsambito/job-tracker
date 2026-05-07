import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadApplications, updateApplication, getStatusMeta } from '../lib/store';
import { useWorkspace } from '../lib/WorkspaceContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const COLUMNS = [
  { value: 'draft',      label: 'Draft',      color: '#888780' },
  { value: 'applied',    label: 'Applied',    color: '#185FA5' },
  { value: 'screening',  label: 'Screening',  color: '#BA7517' },
  { value: 'interview',  label: 'Interview',  color: '#3B6D11' },
  { value: 'offer',      label: 'Offer',      color: '#0F6E56' },
  { value: 'rejected',   label: 'Rejected',   color: '#A32D2D' },
  { value: 'withdrawn',  label: 'Withdrawn',  color: '#5F5E5A' },
];

function StatPill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 20, fontSize: 12,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function AppCard({ app, onDragStart, onDragEnd }) {
  const navigate = useNavigate();
  const meta = getStatusMeta(app.status);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app.id)}
      onDragEnd={onDragEnd}
      onClick={() => navigate(`/application/${app.id}`)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px 14px', cursor: 'grab',
        transition: 'box-shadow 0.15s, transform 0.12s', userSelect: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: meta.color + '18', color: meta.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, fontFamily: "'DM Serif Display', serif", flexShrink: 0,
        }}>
          {app.company?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.company || 'Unnamed'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.role || 'No role'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>
          {format(new Date(app.created_at), 'MMM d')}
        </span>
        {app.resume_version && (
          <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, background: 'var(--surface2)', color: 'var(--text-hint)', fontFamily: "'DM Mono', monospace", maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.resume_version}
          </span>
        )}
        {app.timeline?.length > 1 && (
          <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>{app.timeline.length} updates</span>
        )}
      </div>
      {app.notes && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {app.notes}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ col, apps, onDragStart, onDragEnd, onDrop, onDragOver, isDragOver }) {
  return (
    <div
      style={{
        minWidth: 220, maxWidth: 260, flex: '1 1 220px',
        display: 'flex', flexDirection: 'column',
        background: isDragOver ? col.color + '12' : 'var(--surface2)',
        border: isDragOver ? `2px dashed ${col.color}` : '2px solid transparent',
        borderRadius: 12, transition: 'all 0.15s',
      }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(col.value); }}
      onDrop={(e) => onDrop(e, col.value)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px', borderBottom: `2px solid ${col.color}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{col.label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, background: col.color + '20', color: col.color, padding: '1px 8px', borderRadius: 10 }}>
          {apps.length}
        </span>
      </div>
      <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80, overflowY: 'auto', maxHeight: 'calc(100vh - 270px)' }}>
        {apps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 8px', color: 'var(--text-hint)', fontSize: 11, border: '1px dashed var(--border-strong)', borderRadius: 8 }}>
            Drop here
          </div>
        )}
        {apps.map(app => (
          <AppCard key={app.id} app={app} onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { workspace } = useWorkspace();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [search, setSearch] = useState('');

  const fetchApps = useCallback(async () => {
    if (!workspace) return;
    const data = await loadApplications(workspace.id);
    setApps(data);
    setLoading(false);
  }, [workspace]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  // Real-time subscription
  useEffect(() => {
    if (!workspace) return;
    const channel = supabase
      .channel('applications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `workspace_id=eq.${workspace.id}`,
      }, () => { fetchApps(); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [workspace, fetchApps]);

  const handleDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnd = () => { setDragId(null); setDragOver(null); };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!dragId) return;
    setApps(prev => prev.map(a => a.id === dragId ? { ...a, status } : a));
    await updateApplication(dragId, { status });
    setDragId(null);
    setDragOver(null);
  };

  const filtered = apps.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.company?.toLowerCase().includes(q) || a.role?.toLowerCase().includes(q);
  });

  const totalActive = apps.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length;

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-hint)' }}>Loading board…</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 2 }}>Job Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Drag cards between columns to update status. Changes sync in real time.</p>
        </div>
        <input type="search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
        <Link to="/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Add application</Link>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatPill label="Total" value={apps.length} color="var(--text-hint)" />
        <StatPill label="Active" value={totalActive} color="var(--accent)" />
        {COLUMNS.filter(c => !['draft', 'withdrawn'].includes(c.value)).map(c => (
          <StatPill key={c.value} label={c.label} value={apps.filter(a => a.status === c.value).length} color={c.color} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.value} col={col}
            apps={filtered.filter(a => a.status === col.value)}
            onDragStart={handleDragStart} onDragEnd={handleDragEnd}
            onDrop={handleDrop} onDragOver={setDragOver}
            isDragOver={dragOver === col.value}
          />
        ))}
      </div>

      {apps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-hint)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No applications yet</div>
          <Link to="/new" style={{ color: 'var(--accent)', fontSize: 13 }}>Add your first application</Link>
        </div>
      )}
    </div>
  );
}
