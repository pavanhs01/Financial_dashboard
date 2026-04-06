import supabase from './_supabase.js';
import { getBearerToken, httpError } from './_utils.js';

export async function requireUser(req) {
  const token = getBearerToken(req);
  if (!token) throw httpError(401, 'Unauthorized');

  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw httpError(401, 'Invalid token');
  if (!data?.user) throw httpError(401, 'Unauthorized');

  return data.user;
}

export async function getRoleForUser(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, role, status')
    .eq('id', userId)
    .single();

  if (error) throw httpError(403, 'User profile not found');
  if (!data) throw httpError(403, 'User profile not found');

  if (data.status !== 'active') throw httpError(403, 'User is inactive');
  return data.role;
}

export function requireRole(allowedRoles) {
  return async (req) => {
    const user = await requireUser(req);
    const role = await getRoleForUser(user.id);
    if (!allowedRoles.includes(role)) throw httpError(403, 'Forbidden');
    return { user, role };
  };
}

export const Roles = {
  Viewer: 'Viewer',
  Analyst: 'Analyst',
  Admin: 'Admin',
};
