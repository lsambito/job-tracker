import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { WorkspaceProvider, useWorkspace } from './lib/WorkspaceContext';
import Dashboard from './pages/Dashboard';
import ApplicationDetail from './pages/ApplicationDetail';
import NewApplication from './pages/NewApplication';
import Login from './pages/Login';

function InviteModal({ inviteUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
    }} onClick={onClose}>
      <div className="card" style={{ padding: 28, maxWidth: 480, width: '90%' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
          Invite your friend
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Share this link. Anyone who opens it will join your board and see all applications in real time.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={inviteUrl} readOnly style={{ flex: 1, fontSize: 12, fontFamily: "'DM Mono', monospace" }} />
          <button className="btn btn-primary" onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <button onClick={onClose} className="btn btn-ghost" style={{ marginTop: 16, width: '100%' }}>Close</button>
      </div>
    </div>
  );
}

function NavBar({ onInvite }) {
  const { user, signOut } = useAuth();
  const { workspace } = useWorkspace();

  return (
    <nav style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', display: 'flex', alignItems: 'center',
      height: 56, gap: 16, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'white', fontWeight: 600,
        }}>J</span>
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>JobTracker</span>
      </NavLink>
      {workspace && (
        <span style={{
          fontSize: 11, color: 'var(--text-hint)', padding: '2px 8px',
          background: 'var(--surface2)', borderRadius: 4,
          fontFamily: "'DM Mono', monospace",
        }}>
          {workspace.name}
        </span>
      )}
      <div style={{ flex: 1 }} />
      <button className="btn btn-ghost" onClick={onInvite} style={{ fontSize: 12 }}>
        👥 Invite friend
      </button>
      {user && (
        <>
          <img
            src={user.user_metadata?.avatar_url} alt="avatar"
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)' }}
            onError={e => e.target.style.display = 'none'}
          />
          <button className="btn btn-ghost" onClick={signOut} style={{ fontSize: 12, padding: '5px 12px' }}>
            Sign out
          </button>
        </>
      )}
      <NavLink to="/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
        + Add application
      </NavLink>
    </nav>
  );
}

function AppRoutes() {
  const { user, loading: authLoading } = useAuth();
  const { loading: wsLoading } = useWorkspace();
  const [showInvite, setShowInvite] = useState(false);
  const { inviteUrl } = useWorkspace();

  if (authLoading || wsLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-hint)' }}>
      Loading…
    </div>
  );

  if (!user) return <Login />;

  return (
    <>
      <NavBar onInvite={() => setShowInvite(true)} />
      {showInvite && <InviteModal inviteUrl={inviteUrl} onClose={() => setShowInvite(false)} />}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewApplication />} />
          <Route path="/application/:id" element={<ApplicationDetail />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <AppRoutes />
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
