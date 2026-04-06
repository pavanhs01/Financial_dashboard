import { useEffect, useState } from 'react';
import { Shield, UserPlus, UserX } from 'lucide-react';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Input, Select } from '../components/Input';
import { apiJson } from '../lib/api';

type UserProfile = {
  id: string;
  email: string;
  role: 'Viewer' | 'Analyst' | 'Admin';
  status: 'active' | 'inactive';
  created_at: string;
};

export default function Admin({ token, role }: { token: string; role: string }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const can = role === 'Admin';

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<UserProfile[]>('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [create, setCreate] = useState({ email: '', password: '', role: 'Viewer' as 'Viewer' | 'Analyst' | 'Admin' });

  const createUser = async () => {
    setError(null);
    try {
      await apiJson<UserProfile>('/api/users', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(create),
      });
      setCreate({ email: '', password: '', role: 'Viewer' });
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
  };

  const updateUser = async (id: string, patch: Partial<UserProfile>) => {
    setError(null);
    try {
      await apiJson<UserProfile>('/api/users', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, ...patch }),
      });
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
  };

  const deactivate = async (id: string) => {
    setError(null);
    try {
      await apiJson<UserProfile>('/api/users', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
  };

  if (!can) {
    return (
      <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">This page is restricted to Admin role.</div>
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

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">User management</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Admin-only CRUD over user profiles</div>
            </div>
            <Chip tone="brand">GET/POST/PUT/DELETE /api/users</Chip>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-200/70 dark:border-white/10">
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as any })}
                        className="min-w-[160px]"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Admin">Admin</option>
                      </Select>
                    </td>
                    <td className="py-3 pr-4">
                      <Select
                        value={u.status}
                        onChange={(e) => updateUser(u.id, { status: e.target.value as any })}
                        className="min-w-[160px]"
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </Select>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => deactivate(u.id)}>
                        <UserX className="h-4 w-4" />
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-zinc-500">
                      Loading…
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create user</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Creates an auth user + profile</div>
            </div>
            <Shield className="h-4 w-4 text-zinc-500" />
          </div>

          <div className="mt-4 grid gap-3">
            <Input label="Email" type="email" value={create.email} onChange={(e) => setCreate((c) => ({ ...c, email: e.target.value }))} />
            <Input
              label="Password"
              type="password"
              value={create.password}
              onChange={(e) => setCreate((c) => ({ ...c, password: e.target.value }))}
              hint="At least 6 characters"
            />
            <Select label="Role" value={create.role} onChange={(e) => setCreate((c) => ({ ...c, role: e.target.value as any }))}>
              <option value="Viewer">Viewer</option>
              <option value="Analyst">Analyst</option>
              <option value="Admin">Admin</option>
            </Select>
            <Button onClick={createUser}>
              <UserPlus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
