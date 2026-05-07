import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createApplication, STATUS_OPTIONS } from '../lib/store';
import { useWorkspace } from '../lib/WorkspaceContext';

const FIELD = ({ label, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
    {hint && <div style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 6 }}>{hint}</div>}
    {children}
  </div>
);

export default function NewApplication() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [form, setForm] = useState({ company: '', role: '', job_url: '', status: 'applied', resume_version: '', cover_letter: '', resume_content: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const app = await createApplication(workspace.id, form);
      navigate(`/application/${app.id}`);
    } catch (err) {
      alert('Error saving: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}><Link to="/" style={{ color: 'var(--text-hint)', fontSize: 13 }}>← Applications</Link></div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 6 }}>New Application</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Log everything you submitted so your friend can review it.</p>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Job details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FIELD label="Company *"><input required value={form.company} onChange={set('company')} placeholder="Acme Corp" /></FIELD>
            <FIELD label="Role *"><input required value={form.role} onChange={set('role')} placeholder="Senior Engineer" /></FIELD>
          </div>
          <FIELD label="Job posting URL"><input type="url" value={form.job_url} onChange={set('job_url')} placeholder="https://..." /></FIELD>
          <FIELD label="Status">
            <select value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FIELD>
        </div>
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>What you submitted</div>
          <FIELD label="Resume version" hint="e.g. 'resume-v3-backend.pdf'">
            <input value={form.resume_version} onChange={set('resume_version')} placeholder="resume-v3.pdf" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }} />
          </FIELD>
          <FIELD label="Resume content" hint="Paste the text of the resume you sent.">
            <textarea value={form.resume_content} onChange={set('resume_content')} placeholder="Paste resume text here…" style={{ minHeight: 180, fontSize: 13, fontFamily: "'DM Mono', monospace" }} />
          </FIELD>
          <FIELD label="Cover letter">
            <textarea value={form.cover_letter} onChange={set('cover_letter')} placeholder="Paste cover letter here…" style={{ minHeight: 120 }} />
          </FIELD>
        </div>
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Notes</div>
          <FIELD label="Notes" hint="Why you're interested, how you found it, context.">
            <textarea value={form.notes} onChange={set('notes')} placeholder="This role looks great because…" />
          </FIELD>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: 14 }}>
            {saving ? 'Saving…' : 'Save application'}
          </button>
          <Link to="/" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: 14 }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
