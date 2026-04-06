import supabase from './_supabase.js';
import { setCors, sendError, httpError } from './_utils.js';
import { requireRole, Roles } from './_auth.js';
import { validateCreateRecord, validateUpdateRecord } from './_validation.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      await requireRole([Roles.Viewer, Roles.Analyst, Roles.Admin])(req);

      const { start, end, category, type, q, page = '1', pageSize = '20' } = req.query;
      const p = Math.max(1, parseInt(page, 10) || 1);
      const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
      const from = (p - 1) * ps;
      const to = from + ps - 1;

      let query = supabase
        .from('financial_records')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .order('id', { ascending: false });

      if (start) query = query.gte('date', start);
      if (end) query = query.lte('date', end);
      if (category) query = query.eq('category', category);
      if (type) query = query.eq('type', type);
      if (q) query = query.ilike('notes', `%${q}%`);

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      return res.status(200).json({
        items: data,
        page: p,
        pageSize: ps,
        total: count ?? 0,
      });
    }

    if (req.method === 'POST') {
      const auth = await requireRole([Roles.Admin])(req);
      const payload = validateCreateRecord(req.body);

      const { data, error } = await supabase
        .from('financial_records')
        .insert({ ...payload, created_by: auth.user.id })
        .select()
        .single();
      if (error) throw error;

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const auth = await requireRole([Roles.Admin])(req);
      const { id } = req.body;
      if (!id) throw httpError(400, 'id is required');
      const patch = validateUpdateRecord(req.body);

      const { data, error } = await supabase
        .from('financial_records')
        .update({ ...patch, updated_at: new Date().toISOString(), updated_by: auth.user.id })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const auth = await requireRole([Roles.Admin])(req);
      const { id } = req.body;
      if (!id) throw httpError(400, 'id is required');

      const { error } = await supabase.from('financial_records').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return sendError(res, err);
  }
}
