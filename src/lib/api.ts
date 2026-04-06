export type Role = 'Viewer' | 'Analyst' | 'Admin';

export type FinancialRecord = {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

export async function apiJson<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const snippet = text.slice(0, 120).replace(/\s+/g, ' ');
      throw new Error(`Expected JSON from ${url}, but received: ${snippet}`);
    }
  }

  if (!res.ok) {
    const message = data?.error || `Request failed: ${res.status}`;
    const err: any = new Error(message);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }

  return data as T;
}

export function money(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
