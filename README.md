# FinGuard AI — 智能财务舞弊检测系统

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── constants.ts          # Server config (PORT, NODE_ENV)
│   ├── db/
│   │   ├── index.ts              # Drizzle ORM + postgres.js connection
│   │   ├── schema.ts             # Users table, Zod schemas, types
│   │   └── migrations/
│   │       └── 0_init_add_user_model.sql
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication middleware (authenticateJWT)
│   │   └── errorHandler.ts       # Global error handler
│   ├── repositories/
│   │   └── users.ts              # User CRUD (findByEmail, findById, create, update)
│   ├── routes/
│   │   └── auth.ts               # /api/auth/* (signup, login, me, profile, change-password)
│   └── server.ts                 # Express entry point
├── frontend/
│   └── src/
│       ├── App.tsx               # HashRouter + AuthProvider + protected routes
│       ├── index.css             # Tailwind v4 + FinGuard theme tokens
│       ├── contexts/
│       │   └── AuthContext.tsx   # Auth state, login(), logout(), isAuthenticated
│       ├── components/
│       │   ├── custom/
│       │   │   ├── Login.tsx     # Login form with redirect
│       │   │   ├── Signup.tsx    # Signup form with role selection
│       │   │   └── OmniflowBadge.tsx
│       │   └── ui/              # shadcn/ui components (DO NOT MODIFY)
│       ├── config/
│       │   └── constants.ts     # API_BASE_URL
│       └── pages/
│           └── Index.tsx        # Main dashboard (all 7 views)
├── drizzle.config.ts
├── package.json
└── vercel.json
```

## Tech Stack

- **Backend**: Express.js + TypeScript + Drizzle ORM + postgres.js
- **Auth**: JWT (jsonwebtoken) + bcryptjs password hashing
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- **Routing**: React Router DOM (HashRouter)
- **Notifications**: Sonner toast

## Key Features

1. **Authentication** — JWT login/signup/logout with role-based access (financial_staff, management, auditor, admin)
2. **Dashboard** — KPI cards, risk distribution bars, 6-month trend chart, recent detections
3. **Data Ingestion** — File upload (Excel/CSV), data cleaning report with dedup/fill stats
4. **108 Indicators** — Searchable/filterable indicator table with industry benchmarks and deviation scores
5. **Risk Detection** — 4-level risk grading (none/yellow/orange/red), AI analysis panel
6. **Report Center** — Excel/PDF download, alert ledger with dual-channel push, version management with annotations
7. **System Config** — RBAC permission display, alert rule thresholds, database backup/restore
8. **User Profile** — Edit name/department/phone, change password

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| PUT | /api/auth/profile | Yes | Update profile |
| PUT | /api/auth/change-password | Yes | Change password |

## Auth Flow

- Token stored in `localStorage` under key `'token'`
- `AuthContext` validates token via `/api/auth/me` on load
- `isAuthenticated: null` = loading, `false` = not authed, `true` = authed
- All protected routes redirect to `/login` when not authenticated

## Design System

- **Primary**: `#1c0620` (deep purple-black)
- **Background**: `#eef1ee` (light sage)
- **Surface**: `#ffffff`
- **Border**: `#344056`
- **Text Muted**: `#150049`
- **Risk Colors**: red-500 (high), orange-500 (medium), yellow-400 (low), emerald-500 (none)
- **Font**: Inter (body/heading), JetBrains Mono (numbers/codes)

## Code Generation Guidelines

- Use `authenticateJWT` (not `authenticateToken`) for protected routes
- Repository methods accept `z.infer<typeof insertXSchema>` types
- Use `as InsertUser` type assertion only in `.values()` calls
- All API responses: `{ success: boolean, data: T }` structure
- Frontend API calls use `${API_BASE_URL}/api/...` pattern
- Never modify `frontend/src/components/ui/` files
- Never modify `frontend/src/index.css` structure, only update token values
