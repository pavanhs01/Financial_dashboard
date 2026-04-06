import supabase from './_supabase.js';
import { setCors, sendError } from './_utils.js';
import { requireRole, Roles } from './_auth.js';

function yyyymm(dateStr) {
  return dateStr.slice(0, 7);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    await requireRole([Roles.Viewer, Roles.Analyst, Roles.Admin])(req);

    // Default to only show 2026+ records on the dashboard (per requirement)
    const { start = '2026-01-01', end, recent = '8' } = req.query;

    let base = supabase.from('financial_records').select('id, amount, type, category, date, notes');
    if (start) base = base.gte('date', start);
    if (end) base = base.lte('date', end);

    const { data: all, error } = await base.order('date', { ascending: false }).order('id', { ascending: false });
    if (error) throw error;

    const income = all.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const expenses = all.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
    const net = income - expenses;

    const byCategory = new Map();
    for (const r of all) {
      const key = r.category;
      const prev = byCategory.get(key) || { category: key, income: 0, expense: 0, net: 0 };
      if (r.type === 'income') prev.income += Number(r.amount);
      else prev.expense += Number(r.amount);
      prev.net = prev.income - prev.expense;
      byCategory.set(key, prev);
    }

    const monthly = new Map();
    for (const r of all) {
      const key = yyyymm(r.date);
      const prev = monthly.get(key) || { month: key, income: 0, expense: 0, net: 0 };
      if (r.type === 'income') prev.income += Number(r.amount);
      else prev.expense += Number(r.amount);
      prev.net = prev.income - prev.expense;
      monthly.set(key, prev);
    }

    const recentN = Math.max(1, Math.min(50, parseInt(recent, 10) || 8));
    const recentTx = all.slice(0, recentN);

    return res.status(200).json({
      totals: { income, expenses, net },
      categoryBreakdown: Array.from(byCategory.values()).sort((a, b) => Math.abs(b.net) - Math.abs(a.net)),
      trends: Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month)),
      recent: recentTx,
      count: all.length,
    });
  } catch (err) {
    console.error('API error:', err);
    return sendError(res, err);
  }
}
