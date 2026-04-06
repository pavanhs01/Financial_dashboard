import { Chip } from '../components/Chip';

export default function Settings({ role }: { role: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Settings</div>
          <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Environment + permissions overview</div>
        </div>
        <Chip tone="brand">Role: {role}</Chip>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-zinc-700 dark:text-zinc-200">
        <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 p-4">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">RBAC rules</div>
          <ul className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Viewer: can read summary + records</li>
            <li>Analyst: can read + access analytics endpoints</li>
            <li>Admin: full access (records CRUD + manage users)</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 p-4">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Backend implementation</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Implemented as serverless API routes using Express-like layering: middleware (auth + role), validation,
            controllers, and aggregation logic.
          </div>
        </div>
      </div>
    </div>
  );
}
