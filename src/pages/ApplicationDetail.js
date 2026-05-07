import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApplication, updateApplication, deleteApplication, addTimelineEvent, STATUS_OPTIONS, getStatusMeta } from '../lib/store';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

const FIELD = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
      {label}
    </label>
    {children}
  </div>
);

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );
}

function TextBlock({ content, mono }) {
  if (!content) return <div style={{ color: 'var(--text-hint)', fontSize: 13, fontStyle: 'italic' }}>None provided.</div>;
  return (
    <pre style={{
      fontFamily: mono ? "'DM Mono', monospace" : "'Sora', sans-serif",
      fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      color: 'var(--text-primary)', background: 'var(--surface2)',
      padding: 16, borderRadius: 8, border: '1px solid var(--border)', margin: 0,
    }}>
      {content}
    </pre>
  );
}

function Timeline({ events }) {
  if (!events?.length) return <div style={{ color: 'var(--text-hint)', fontSize: 13 }}>No events yet.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...events].reverse().map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13 }}>{ev.event}</div>
            <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
              {format(new Date(ev.date), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newEvent, setNewEvent] = useState('');
  const [tab, setTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getApplication(id).then(data => { setApp(data); setForm(data); }).catch(() => navigate('/'));
  }, [id, navigate]);

  if (!app) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-hint)' }}>Loading…</div>;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveEdit = async () => {
    setSaving(true);
    const updated = await updateApplication(id, form);
    setApp(updated);
    setEditing(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this application?')) {
      await deleteApplication(id);
      navigate('/');
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.trim()) return;
    const updated = await addTimelineEvent(id, newEvent.trim());
    setApp(updated);
    setNewEvent('');
  };

  const meta = getStatusMeta(app.status);
  const TABS = ['overview', 'resume', 'cover letter', 'timeline'];

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--text-hint)', fontSize: 13 }}>← Applications</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: meta.color + '18', color: meta.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", flexShrink: 0,
        }}>
          {app.company?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {app.company || 'Unnamed company'}
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{app.role || 'No role specified'}</span>
            <StatusBadge status={app.status} />
            {app.resume_version && (
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'var(--surface2)', color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
                {app.resume_version}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setEditing(e => !e)}>{editing ? 'Cancel' : 'Edit'}</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', fontSize: 13, fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
            marginBottom: -1, textTransform: 'capitalize', transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (editing ? (
        <div>
          <Section title="Job details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FIELD label="Company"><input value={form.company || ''} onChange={set('company')} /></FIELD>
              <FIELD label="Role"><input value={form.role || ''} onChange={set('role')} /></FIELD>
            </div>
            <FIELD label="Job URL"><input type="url" value={form.job_url || ''} onChange={set('job_url')} /></FIELD>
            <FIELD label="Status">
              <select value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FIELD>
          </Section>
          <Section title="Submission details">
            <FIELD label="Resume version"><input value={form.resume_version || ''} onChange={set('resume_version')} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }} /></FIELD>
            <FIELD label="Notes"><textarea value={form.notes || ''} onChange={set('notes')} style={{ minHeight: 100 }} /></FIELD>
          </Section>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <Section title="Job details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Company</div>
                <div style={{ fontWeight: 500 }}>{app.company || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Role</div>
                <div style={{ fontWeight: 500 }}>{app.role || '—'}</div>
              </div>
            </div>
            {app.job_url && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Job posting</div>
                <a href={app.job_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13, wordBreak: 'break-all' }}>{app.job_url}</a>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                <StatusBadge status={app.status} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Resume version</div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--text-secondary)' }}>{app.resume_version || '—'}</span>
              </div>
            </div>
          </Section>
          <Section title="Notes"><TextBlock content={app.notes} /></Section>
          <Section title="Meta">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <div>Created: {format(new Date(app.created_at), "MMMM d, yyyy 'at' h:mm a")}</div>
              <div>Last updated: {format(new Date(app.updated_at), "MMMM d, yyyy 'at' h:mm a")}</div>
            </div>
          </Section>
        </div>
      ))}

      {tab === 'resume' && (editing ? (
        <Section title="Resume content">
          <FIELD label="Paste resume text">
            <textarea value={form.resume_content || ''} onChange={set('resume_content')} style={{ minHeight: 400, fontFamily: "'DM Mono', monospace", fontSize: 13 }} />
          </FIELD>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </Section>
      ) : (
        <Section title="Resume submitted"><TextBlock content={app.resume_content} mono /></Section>
      ))}

      {tab === 'cover letter' && (editing ? (
        <Section title="Cover letter">
          <FIELD label="Cover letter text">
            <textarea value={form.cover_letter || ''} onChange={set('cover_letter')} style={{ minHeight: 320 }} />
          </FIELD>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </Section>
      ) : (
        <Section title="Cover letter submitted"><TextBlock content={app.cover_letter} /></Section>
      ))}

      {tab === 'timeline' && (
        <div>
          <Section title="Add an update">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newEvent} onChange={e => setNewEvent(e.target.value)}
                placeholder="e.g. 'Phone screen scheduled for May 10'"
                onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleAddEvent}>Add</button>
            </div>
          </Section>
          <Section title="Timeline"><Timeline events={app.timeline} /></Section>
        </div>
      )}
    </div>
  );
}
