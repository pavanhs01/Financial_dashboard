# Financial_dashboard

A production-style **Finance Dashboard** built with a React + Tailwind frontend and a Node/Express-style backend (implemented as Vercel Serverless Functions). The system supports **role-based access control (RBAC)**, financial record management, and analytics/summary APIs backed by a real persistent database (Supabase Postgres).

> Note: Authentication is powered by Supabase Auth. RBAC permissions are enforced server-side via middleware-style checks.

---

## Features

### RBAC (Role-Based Access Control)
- Roles: **Viewer**, **Analyst**, **Admin**
- Permissions enforced by API:
  - **Viewer**: read-only access (summary + records)
  - **Analyst**: read + analytics endpoints
  - **Admin**: full CRUD on records + user management endpoints

### Financial Records
- Fields: `amount`, `type (income/expense)`, `category`, `date`, `notes`
- APIs:
  - Create / Read / Update / Delete
  - Filtering (date, category, type)
  - Pagination and basic search

### Dashboard + Analytics APIs
- Summary API includes:
  - Total income
  - Total expenses
  - Net balance
  - Category breakdown
  - Recent transactions
  - Monthly trends
- Analytics API includes:
  - Weekly or monthly bucketed series
  - Top categories ranking

### Dashboard Visualizations
- **Line chart** for monthly trends (income/expense/net)
- **Pie chart** for category distribution

---

## Technologies Used

### Frontend
- **Vite + React + TypeScript**
- **Tailwind CSS v4**
- **react-router-dom**
- **recharts** (charts)
- **lucide-react** (icons)

### Backend (Node/Express-style)
- Vercel Serverless Functions under `api/`
- **Supabase JS client** (`@supabase/supabase-js`) using the **Service Role Key** server-side
- Middleware-style RBAC + validation utilities

### Database + Auth
- **Supabase Postgres** for persistence
- **Supabase Auth** for authentication

---

## Installation

### 1) Prerequisites
- Node.js 18+ recommended
- npm

### 2) Install dependencies
```bash
npm install
```

### 3) Environment variables
This project expects Supabase environment variables to be available (typically via `.env` and deployment configuration):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_GOOGLE_CLIENT_ID` (optional, only for Google sign-in)
- `VITE_GOOGLE_AUTH_PROXY` (optional, only for Google sign-in)

> These are already configured in the deployment environment for this project.

### 4) Build
```bash
npm run build
```

---

## Usage

### Run locally (dev)
```bash
npm run dev
```

If you are using PowerShell and `npm` is blocked by execution policy, run:
```bash
npm.cmd run dev
```

When the server starts, open the exact Vite URL it prints, typically:
```bash
http://127.0.0.1:5173/
```

### How RBAC works
- The frontend uses Supabase Auth to obtain a JWT access token.
- API routes read `Authorization: Bearer <token>` and:
  1) validate the token via `supabase.auth.getUser(token)`
  2) load the user role from the `user_profiles` table
  3) enforce access rules per endpoint

### Role selection (demo convenience)
The UI includes a role picker that lets the currently authenticated user select **Viewer / Analyst / Admin**.
This is implemented as a self-service upsert to `user_profiles` and is intended for demo/testing.

---

## API Documentation (High Level)

### Session
- `GET /api/auth-session`
  - Returns the current user id/email + resolved role.
  - Auto-provisions a missing profile as Viewer.

### Roles
- `POST /api/role`
  - Self-service role selection (Viewer/Analyst/Admin)

### Records
- `GET /api/records` (Viewer/Analyst/Admin)
  - Query params: `start`, `end`, `category`, `type`, `q`, `page`, `pageSize`
- `POST /api/records` (Admin)
- `PUT /api/records` (Admin)
- `DELETE /api/records` (Admin)

### Summary
- `GET /api/summary` (Viewer/Analyst/Admin)
  - Returns totals, trends, category breakdown, recent transactions
  - Defaults to showing records from `2026-01-01` onwards unless `start` is provided

### Analytics
- `GET /api/analytics?groupBy=week|month` (Analyst/Admin)

### Users
- `GET/POST/PUT/DELETE /api/users` (Admin)
  - Admin user management + status/role updates

---

## Project Structure

```text
.
├── api/
│   ├── _supabase.js          # shared server-side Supabase client
│   ├── _auth.js              # auth + RBAC helpers (middleware-style)
│   ├── _validation.js        # request validation helpers
│   ├── _utils.js             # CORS + error helpers
│   ├── auth-session.js       # session + role resolver
│   ├── role.js               # self-service role selection
│   ├── records.js            # financial records CRUD + filtering
│   ├── summary.js            # summary aggregations
│   ├── analytics.js          # analytics aggregations
│   └── users.js              # admin user management
│
├── src/
│   ├── components/
│   │   ├── charts/Charts.tsx # recharts line + pie
│   │   ├── RoleSwitcher.tsx  # role dropdown
│   │   └── ...
│   ├── pages/
│   │   ├── Overview.tsx
│   │   ├── Records.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── supabase.ts
│   │   └── googleAuth.ts
│   ├── App.tsx
│   ├── AppShell.tsx
│   └── main.tsx
│
├── public/
│   └── favicon.svg
├── index.html
└── README.md
```

---

## Future Improvements
- Add proper **Admin-only role assignment** (instead of self-service role selection)
- Add server-side aggregation with dedicated tables/materialized views for large datasets
- Implement automated tests (unit + integration)
- Add OpenAPI/Swagger documentation
- Add rate limiting to API routes
- Improve chart performance and code splitting (bundle size)

---
