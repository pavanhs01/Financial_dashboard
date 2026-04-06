import supabase from './_supabase.js';
import { setCors, sendError } from './_utils.js';
import { requireUser, getRoleForUser, Roles } from './_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await requireUser(req);
    let role;
    try {
      role = await getRoleForUser(user.id);
    } catch (e) {
      // Auto-provision missing profile so first-time signups don't break the app.
      const { data: inserted, error: insErr } = await supabase
        .from('user_profiles')
        .insert({ id: user.id, email: user.email, role: Roles.Viewer, status: 'active' })
        .select('role')
        .single();
      if (insErr) throw insErr;
      role = inserted.role;
    }

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      role,
    });
  } catch (err) {
    console.error('API error:', err);
    return sendError(res, err);
  }
}
