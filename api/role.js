import supabase from './_supabase.js';
import { setCors, sendError, httpError } from './_utils.js';
import { requireUser, Roles } from './_auth.js';

const allowed = [Roles.Viewer, Roles.Analyst, Roles.Admin];

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authed = await requireUser(req);
    const { userId, email, role } = req.body || {};

    if (!userId || typeof userId !== 'string') throw httpError(400, 'userId is required');
    if (authed.id !== userId) throw httpError(403, 'Forbidden');
    if (!allowed.includes(role)) throw httpError(400, 'Invalid role');

    const safeEmail = email || authed.email;

    // Upsert profile for this user (self-service role selection per request)
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          email: safeEmail,
          role,
          status: 'active',
          updated_at: new Date().toISOString(),
          updated_by: userId,
        },
        { onConflict: 'id' }
      )
      .select('id, email, role, status, created_at')
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('API error:', err);
    return sendError(res, err);
  }
}
