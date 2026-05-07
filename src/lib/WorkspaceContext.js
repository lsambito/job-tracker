import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getOrCreateWorkspace, joinWorkspaceByCode } from './store';
import { supabase } from './supabase';

const WorkspaceContext = createContext({});

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Check for invite code in URL
    const hash = window.location.hash;
    const inviteMatch = hash.match(/invite=([a-zA-Z0-9]+)/);

    const init = async () => {
      try {
        if (inviteMatch) {
          const ws = await joinWorkspaceByCode(inviteMatch[1]);
          setWorkspace(ws);
          window.location.hash = '';
        } else {
          const ws = await getOrCreateWorkspace();
          setWorkspace(ws);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user]);

  const inviteUrl = workspace
    ? `${window.location.origin}/#invite=${workspace.invite_code}`
    : null;

  return (
    <WorkspaceContext.Provider value={{ workspace, loading, error, inviteUrl, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
