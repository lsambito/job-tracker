import { supabase } from './supabase';

export const STATUS_OPTIONS = [
  { value: 'draft',      label: 'Draft',      color: '#888780' },
  { value: 'applied',    label: 'Applied',    color: '#185FA5' },
  { value: 'screening',  label: 'Screening',  color: '#BA7517' },
  { value: 'interview',  label: 'Interview',  color: '#3B6D11' },
  { value: 'offer',      label: 'Offer',      color: '#0F6E56' },
  { value: 'rejected',   label: 'Rejected',   color: '#A32D2D' },
  { value: 'withdrawn',  label: 'Withdrawn',  color: '#5F5E5A' },
];

export const getStatusMeta = (value) =>
  STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0];

// Workspace
export async function getOrCreateWorkspace() {
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is already in a workspace
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(*)')
    .eq('user_id', user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    return memberships[0].workspaces;
  }

  // Create a new workspace
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert([{ name: `${user.user_metadata?.full_name || 'My'}'s Board`, owner_id: user.id }])
    .select()
    .single();

  if (error) throw error;

  // Add owner as member
  await supabase.from('workspace_members').insert([{
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  }]);

  return workspace;
}

export async function joinWorkspaceByCode(inviteCode) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error || !workspace) throw new Error('Invalid invite code');

  // Check if already a member
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single();

  if (!existing) {
    await supabase.from('workspace_members').insert([{
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'member',
    }]);
  }

  return workspace;
}

export async function getWorkspaceMembers(workspaceId) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*, user:user_id(id)')
    .eq('workspace_id', workspaceId);
  if (error) throw error;
  return data || [];
}

// Applications
export async function loadApplications(workspaceId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getApplication(id) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createApplication(workspaceId, fields) {
  const timeline = [{ date: new Date().toISOString(), event: 'Application created' }];
  const { data, error } = await supabase
    .from('applications')
    .insert([{ workspace_id: workspaceId, status: 'applied', timeline, ...fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateApplication(id, updates) {
  const existing = await getApplication(id);
  let timeline = existing.timeline || [];
  if (updates.status && updates.status !== existing.status) {
    timeline = [...timeline, {
      date: new Date().toISOString(),
      event: `Status changed to ${getStatusMeta(updates.status).label}`,
    }];
    updates.timeline = timeline;
  }
  const { data, error } = await supabase
    .from('applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteApplication(id) {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
}

export async function addTimelineEvent(id, event) {
  const app = await getApplication(id);
  const timeline = [...(app.timeline || []), { date: new Date().toISOString(), event }];
  return updateApplication(id, { timeline });
}
