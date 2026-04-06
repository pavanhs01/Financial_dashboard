import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Input, Select } from '../components/Input';
import { apiJson, money } from '../lib/api';
import type { FinancialRecord } from '../lib/api';

type RecordsResponse = { items: FinancialRecord[]; page: number; pageSize: number; total: number };

function todayMinus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Records({ token, role }: { token: string; role: string }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FinancialRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [start, setStart] = useState(todayMinus(90));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  const [page, setPage] = useState(1);
  const pageSize = 15;

  const canWrite = role === 'Admin';

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      if (category) params.set('category', category);
      if (type) params.set('type', type);
      if (q) params.set('q', q);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const data = await apiJson<RecordsResponse>(`/api/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, type, category]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchItems();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, start, end]);

  const [form, setForm] = useState({
    id: null as number | null,
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const resetForm = () =>
    setForm({ id: null, amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10), notes: '' });

  const save = async () => {
    setError(null);
    try {
      if (!canWrite) throw new Error('Admin role required for write operations');
      if (!form.amount || !form.category || !form.date) throw new Error('Please fill amount, category, date');
      const payload: any = {
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        notes: form.notes || null,
      };

      if (form.id) {
        await apiJson<FinancialRecord>('/api/records', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: form.id, ...payload }),
        });
      } else {
        await apiJson<FinancialRecord>('/api/records', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      await fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
  };

  const edit = (r: FinancialRecord) => {
    setForm({
      id: r.id,
      amount: String(r.amount),
      type: r.type,
      category: r.category,
      date: r.date,
      notes: r.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id: number) => {
    setError(null);
    try {
      if (!canWrite) throw new Error('Admin role required for delete operations');
      await apiJson<{ ok: true }>('/api/records', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      await fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Filters</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Query records with pagination</div>
            </div>
            <Chip tone="neutral">GET /api/records</Chip>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Input label="Search notes" placeholder="e.g. invoice" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="income">income</option>
              <option value="expense">expense</option>
            </Select>
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input label="Start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="End" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <div className="flex items-end">
              <Button variant="secondary" onClick={() => { setQ(''); setType(''); setCategory(''); setStart(todayMinus(90)); setEnd(new Date().toISOString().slice(0, 10)); }}>
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Notes</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-200/70 dark:border-white/10">
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{r.date}</td>
                    <td className="py-3 pr-4">
                      <Chip tone={r.type === 'income' ? 'good' : 'bad'}>{r.type}</Chip>
                    </td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{r.category}</td>
                    <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{r.notes || '—'}</td>
                    <td className="py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {money(r.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => edit(r)}
                          disabled={!canWrite}
                          title={canWrite ? 'Edit' : 'Admin only'}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => del(r.id)}
                          disabled={!canWrite}
                          title={canWrite ? 'Delete' : 'Admin only'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-zinc-500">
                      Loading…
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-zinc-500">Page {page}</div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{form.id ? 'Edit record' : 'New record'}</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Admin-only create/update</div>
            </div>
            <Chip tone={canWrite ? 'brand' : 'neutral'}>{canWrite ? 'Writable' : 'Read-only'}</Chip>
          </div>

          <div className="mt-4 grid gap-3">
            <Input label="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}>
              <option value="expense">expense</option>
              <option value="income">income</option>
            </Select>
            <Input label="Category" placeholder="e.g. Payroll" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input label="Notes" placeholder="optional" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />

            <div className="flex gap-2">
              <Button onClick={save} disabled={!canWrite}>
                <Plus className="h-4 w-4" />
                {form.id ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Clear
              </Button>
            </div>

            {!canWrite ? (
              <div className="text-xs text-zinc-500">
                You are signed in as <span className="font-medium">{role}</span>. Only Admin can create/update/delete.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
