import supabase from './_supabase.js';
import { setCors, sendError, httpError } from './_utils.js';
import { requireRole, Roles } from './_auth.js';
import { validateUserUpdate } from './_validation.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const auth = await requireRole([Roles.Admin])(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, role, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { email, role } = req.body;
      const pwd = req.body.password;
      if (!email || !pwd) throw httpError(400, 'email and password are required');
      if (!['Viewer', 'Analyst', 'Admin'].includes(role)) throw httpError(400, 'Invalid role');

      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: pwd,
        email_confirm: true,
      });
      if (createErr) throw createErr;

      const { data: profile, error: profileErr } = await supabase
        .from('user_profiles')
        .insert({
          id: created.user.id,
          email,
          role,
          status: 'active',
          created_by: auth.user.id,
        })
        .select('id, email, role, status, created_at')
        .single();
      if (profileErr) throw profileErr;

      return res.status(201).json(profile);
    }

    if (req.method === 'PUT') {
      const { id } = req.body;
      if (!id) throw httpError(400, 'id is required');
      const patch = validateUserUpdate(req.body);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...patch, updated_at: new Date().toISOString(), updated_by: auth.user.id })
        .eq('id', id)
        .select('id, email, role, status, created_at')
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) throw httpError(400, 'id is required');

      // Soft-delete by inactivating. Don't delete auth user.
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ status: 'inactive', updated_at: new Date().toISOString(), updated_by: auth.user.id })
        .eq('id', id)
        .select('id, email, role, status, created_at')
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return sendError(res, err);
  }
}
