import supabase from './_supabase.js';
import { setCors, sendError, httpError } from './_utils.js';
import { requireRole, Roles } from './_auth.js';

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    await requireRole([Roles.Analyst, Roles.Admin])(req);

    const { start, end, groupBy = 'week' } = req.query;
    if (!['week', 'month'].includes(groupBy)) throw httpError(400, 'groupBy must be week or month');

    let base = supabase.from('financial_records').select('amount, type, category, date');
    if (start) base = base.gte('date', start);
    if (end) base = base.lte('date', end);

    const { data: all, error } = await base.order('date', { ascending: true }).order('id', { ascending: true });
    if (error) throw error;

    const keyFor = (dateStr) => {
      if (groupBy === 'month') return dateStr.slice(0, 7);
      // week: ISO week start (Mon)
      const d = new Date(dateStr + 'T00:00:00Z');
      const day = d.getUTCDay(); // 0 Sun..6 Sat
      const diff = (day === 0 ? -6 : 1) - day;
      d.setUTCDate(d.getUTCDate() + diff);
      return isoDate(d);
    };

    const buckets = new Map();
    for (const r of all) {
      const k = keyFor(r.date);
      const prev = buckets.get(k) || { bucket: k, income: 0, expense: 0, net: 0, txCount: 0 };
      if (r.type === 'income') prev.income += Number(r.amount);
      else prev.expense += Number(r.amount);
      prev.net = prev.income - prev.expense;
      prev.txCount += 1;
      buckets.set(k, prev);
    }

    const categoryTotals = new Map();
    for (const r of all) {
      const prev = categoryTotals.get(r.category) || { category: r.category, total: 0, income: 0, expense: 0 };
      if (r.type === 'income') prev.income += Number(r.amount);
      else prev.expense += Number(r.amount);
      prev.total = prev.income - prev.expense;
      categoryTotals.set(r.category, prev);
    }

    const series = Array.from(buckets.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
    const topCategories = Array.from(categoryTotals.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total)).slice(0, 8);

    return res.status(200).json({
      groupBy,
      series,
      topCategories,
      count: all.length,
    });
  } catch (err) {
    console.error('API error:', err);
    return sendError(res, err);
  }
}
