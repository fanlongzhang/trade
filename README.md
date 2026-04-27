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

## Changelog

### v2.4.1 (2026-04-27)

**新增功能：**
- 实现基于角色的权限控制系统（RBAC）
  - 财务专员：数据上传、指标计算、风险检测、报告下载、预警查看
  - 企业管理层：风险审阅、报告查看、AI分析、决策制定
  - 审计人员：数据核查、版本追溯、历史对比、数据导出
  - 系统管理员：用户管理、权限配置、系统维护、规则配置、指标配置、数据备份
- 基于角色的菜单访问控制，不同角色看到不同的导航菜单
- 点击风险等级查看企业列表的交互功能
- 近6月风险趋势折线图展示
- 拖拽上传文件功能
- 本地存储功能，登录后数据不丢失
- 数据清洗报告和风险趋势图表实时更新

**功能优化：**
- 修复指标计算值均为16.3的问题
- 修复登录后上传数据消失的问题
- 修复数据不会随更新或选择不同数据而实时更新的问题
- 修复注册后无法登录的问题（密码验证逻辑优化）

**技术改进：**
- 集成DeepSeek API进行指标计算
- 优化前后端模拟数据生成逻辑
- 修复登录API的密码验证逻辑，支持哈希和明文密码

**测试账号：**
- 系统管理员：admin@example.com / admin123
- 财务专员：financial@test.com / 123456
- 企业管理层：management@test.com / 123456
- 审计人员：auditor@test.com / 123456

### v2.4.0 (2026-04-26)

**初始版本：**
- 完整的认证系统（JWT登录/注册/登出）
- 控制台KPI卡片和风险分布图表
- 数据接入功能（Excel/CSV上传）
- 108条指标计算和展示
- 风险检测功能（4级风险分级）
- 报告中心（Excel/PDF下载）
- 系统配置（RBAC权限显示）
- 用户个人中心（编辑资料、修改密码）
