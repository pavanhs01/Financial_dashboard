import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { apiJson, money } from '../lib/api';

type AnalyticsResponse = {
  groupBy: 'week' | 'month';
  series: { bucket: string; income: number; expense: number; net: number; txCount: number }[];
  topCategories: { category: string; total: number; income: number; expense: number }[];
  count: number;
};

function BarRow({ label, a, b, max }: { label: string; a: number; b: number; max: number }) {
  const aPct = max ? Math.round((a / max) * 100) : 0;
  const bPct = max ? Math.round((b / max) * 100) : 0;
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
        <div className="text-xs text-zinc-500">Net: {money(a - b)}</div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-16 text-xs text-zinc-500">Income</div>
          <div className="h-2 flex-1 rounded-full bg-zinc-200/70 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${aPct}%` }} />
          </div>
          <div className="w-20 text-right text-xs text-zinc-600 dark:text-zinc-300">{money(a)}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 text-xs text-zinc-500">Expense</div>
          <div className="h-2 flex-1 rounded-full bg-zinc-200/70 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${bPct}%` }} />
          </div>
          <div className="w-20 text-right text-xs text-zinc-600 dark:text-zinc-300">{money(b)}</div>
        </div>
      </div>
    </div>
  );
}

export default function Analytics({ token, role }: { token: string; role: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'week' | 'month'>('week');

  const canView = role === 'Analyst' || role === 'Admin';

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ groupBy });
      const d = await apiJson<AnalyticsResponse>(`/api/analytics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(d);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, groupBy]);

  const maxSeries = useMemo(() => {
    if (!data) return 0;
    return Math.max(...data.series.map((s) => Math.max(s.income, s.expense)), 0);
  }, [data]);

  if (!canView) {
    return (
      <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Analytics</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              This page requires Analyst or Admin role.
            </div>
          </div>
          <Chip tone="neutral">403 guarded</Chip>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Analytics API</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Guarded by RBAC: Analyst/Admin</div>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="brand">GET /api/analytics</Chip>
            <Button variant="secondary" onClick={fetchAnalytics}>
              <Sparkles className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant={groupBy === 'week' ? 'primary' : 'secondary'} onClick={() => setGroupBy('week')}>
            Weekly
          </Button>
          <Button variant={groupBy === 'month' ? 'primary' : 'secondary'} onClick={() => setGroupBy('month')}>
            Monthly
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Income vs expense series</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Buckets: {groupBy}</div>
            </div>
            <Chip tone="neutral">{loading ? 'Loading…' : `${data?.series.length || 0} buckets`}</Chip>
          </div>

          <div className="mt-4 space-y-3">
            {(data?.series || []).slice(-10).map((s) => (
              <BarRow key={s.bucket} label={s.bucket} a={s.income} b={s.expense} max={maxSeries} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Top categories</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Net total by category</div>
            </div>
            <Chip tone="brand">Ranked</Chip>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topCategories || []).map((c) => (
                  <tr key={c.category} className="border-t border-zinc-200/70 dark:border-white/10">
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{c.category}</td>
                    <td className="py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">{money(c.total)}</td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-zinc-500">
                      Loading…
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
