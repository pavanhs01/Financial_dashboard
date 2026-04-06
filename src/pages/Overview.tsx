import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Chip } from '../components/Chip';
import { apiJson, money } from '../lib/api';
import { TrendLineChart, CategoryPieChart } from '../components/charts/Charts';

type Summary = {
  totals: { income: number; expenses: number; net: number };
  categoryBreakdown: { category: string; income: number; expense: number; net: number }[];
  trends: { month: string; income: number; expense: number; net: number }[];
  recent: { id: number; amount: number; type: 'income' | 'expense'; category: string; date: string; notes: string | null }[];
  count: number;
};

function MiniBar({ value, max, tone }: { value: number; max: number; tone: 'good' | 'bad' | 'brand' }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((Math.abs(value) / max) * 100));
  const color =
    tone === 'good'
      ? 'bg-emerald-500'
      : tone === 'bad'
        ? 'bg-rose-500'
        : 'bg-indigo-500';
  return (
    <div className="h-2 w-full rounded-full bg-zinc-200/70 dark:bg-white/10 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Overview({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<Summary>('/api/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const maxTrend = useMemo(() => {
    if (!summary) return 0;
    return Math.max(...summary.trends.map((t) => Math.max(t.income, t.expense)), 0);
  }, [summary]);

  const maxCat = useMemo(() => {
    if (!summary) return 0;
    return Math.max(...summary.categoryBreakdown.map((c) => Math.abs(c.net)), 0);
  }, [summary]);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total income"
          value={loading ? '—' : money(summary?.totals.income || 0)}
          hint={loading ? 'Loading…' : `${summary?.count || 0} transactions`}
          tone="good"
          icon={<ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
        />
        <StatCard
          label="Total expenses"
          value={loading ? '—' : money(summary?.totals.expenses || 0)}
          hint={loading ? 'Loading…' : 'Sum of expense records'}
          tone="bad"
          icon={<ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-300" />}
        />
        <StatCard
          label="Net balance"
          value={loading ? '—' : money(summary?.totals.net || 0)}
          hint={loading ? 'Loading…' : summary && summary.totals.net >= 0 ? 'Positive cashflow' : 'Negative cashflow'}
          tone="brand"
          icon={<Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />}
        />
        <StatCard
          label="Trend signal"
          value={loading ? '—' : summary && summary.trends.length ? `${summary.trends.at(-1)?.month}` : '—'}
          hint={loading ? 'Loading…' : 'Latest month in range'}
          tone="neutral"
          icon={<TrendingUp className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Monthly trends</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Income vs expenses</div>
            </div>
            <Chip tone="brand">API: /api/summary</Chip>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Line chart</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Income, expense, and net by month</div>
              <div className="mt-3">
                <TrendLineChart data={(summary?.trends || []).slice(-12)} />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Category pie</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Share by absolute net amount</div>
              <div className="mt-3">
                <CategoryPieChart data={(summary?.categoryBreakdown || []).slice(0, 8)} />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(summary?.trends || []).slice(-10).map((t) => (
              <div key={t.month} className="rounded-2xl border border-zinc-200/70 dark:border-white/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.month}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Net: {money(t.net)}</div>
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-xs text-zinc-500">Income</div>
                    <MiniBar value={t.income} max={maxTrend} tone="good" />
                    <div className="w-24 text-right text-xs text-zinc-600 dark:text-zinc-300">{money(t.income)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-xs text-zinc-500">Expense</div>
                    <MiniBar value={t.expense} max={maxTrend} tone="bad" />
                    <div className="w-24 text-right text-xs text-zinc-600 dark:text-zinc-300">{money(t.expense)}</div>
                  </div>
                </div>
              </div>
            ))}
            {!loading && summary && summary.trends.length === 0 ? (
              <div className="text-sm text-zinc-500">No data in range.</div>
            ) : null}
          </div>
        </div>

        <div className="xl:col-span-1 rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm xl:sticky xl:top-6 self-start">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Category breakdown</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Net per category</div>
            </div>
            <Chip tone="neutral">Aggregated</Chip>
          </div>

          <div className="mt-4 space-y-3">
            {(summary?.categoryBreakdown || []).slice(0, 12).map((c) => (
              <div key={c.category} className="rounded-2xl border border-zinc-200/70 dark:border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.category}</div>
                  <Chip tone={c.net >= 0 ? 'good' : 'bad'}>{money(c.net)}</Chip>
                </div>
                <div className="mt-3">
                  <MiniBar value={c.net} max={maxCat} tone={c.net >= 0 ? 'good' : 'bad'} />
                </div>
              </div>
            ))}
            {!loading && summary && summary.categoryBreakdown.length === 0 ? (
              <div className="text-sm text-zinc-500">No data.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent transactions</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Latest activity</div>
          </div>
          <Chip tone="brand">Live</Chip>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Notes</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.recent || []).map((r) => (
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
                </tr>
              ))}
              {loading ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
