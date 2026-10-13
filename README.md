# Nexus Workspace

A production-quality **Workspace Manager SaaS** built with Next.js App Router, PostgreSQL, Prisma, Auth.js (NextAuth v5), and a polished dark dashboard UI.

## Features

- Marketing landing page with product sections and CTA
- Email/password authentication (sign up, sign in, sign out)
- Protected dashboard routes with Next.js proxy and server-side authorization
- Multi-workspace support with role-based access (`OWNER`, `ADMIN`, `MEMBER`)
- Projects CRUD with list/grid views, search, and status filters
- Tasks CRUD with priorities, due dates, assignees, search/filters, and Kanban columns
- Team page with invitations and member management
- Settings for profile, workspace, and appearance notes
- Activity feed and dashboard metrics from live database queries
- Motion-powered entrance animations with reduced-motion support
- Toast notifications, loading/empty/error states, and form validation (Zod)

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS v4, shadcn-style components (Base UI + CVA)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js / `next-auth` v5 (Credentials provider, JWT sessions)
- **Forms:** React Hook Form patterns via Server Actions + Zod
- **UI icons:** Lucide React
- **Animation:** Motion for React
- **Notifications:** Sonner

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (local, Docker, Neon, Supabase, etc.)

## Installation

```bash
npm install
cp .env.example .env
```

Edit `.env` with your database URL and auth secret.

Generate the Prisma client:

```bash
npm run db:generate
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |

See [`.env.example`](.env.example) for placeholders.

## Database setup

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in `.env`.
3. Apply schema:

```bash
npm run db:migrate
# or for quick prototyping:
npm run db:push
```

### Optional demo seed (local only)

The seed script creates **clearly labeled demo data** and demo accounts:

```bash
npm run db:seed
```

Demo login:

- `owner@demo.local` / `Password123!`
- `member@demo.local` / `Password123!`

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Authentication setup

This app uses the **Credentials** provider with bcrypt password hashes stored in PostgreSQL.

1. Set `AUTH_SECRET` and `AUTH_URL` in `.env`.
2. On Vercel, add the same variables in Project Settings → Environment Variables.
3. Set `AUTH_URL` to your production domain (e.g. `https://your-app.vercel.app`).

Invitations use secure token links (`/settings?invite=...`) that must be opened by a signed-in user whose email matches the invitation.

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`.
4. Use a hosted PostgreSQL provider (Neon/Supabase/Vercel Postgres).
5. Run migrations against production (`npm run db:deploy`) via CI or a one-off command.
6. Deploy.

`postinstall` runs `prisma generate` so the client is available during builds.

## Project structure

```
src/
  app/                 # App Router pages (marketing, auth, dashboard)
  components/          # UI, layout, feature components
  lib/                 # Auth, Prisma, validations, server actions
  proxy.ts             # Route protection (Next.js 16)
prisma/
  schema.prisma        # Data models
  seed.ts              # Optional demo seed
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `PrismaClientInitializationError` | Check `DATABASE_URL` and that PostgreSQL is running |
| Auth redirect loops | Ensure `AUTH_SECRET` and `AUTH_URL` are set |
| Build fails on Prisma | Run `npm run db:generate` |
| Invitation link fails | Sign in with the invited email before accepting |
| PostgreSQL is not installed | Create a database on Neon/Supabase (or local Postgres) and set `DATABASE_URL`. The app structure is complete, but persistence and auth will not work until the database is connected. |

## Suggested future improvements

- OAuth providers (Google/GitHub) via Auth.js
- Email delivery for invitations (Resend/SendGrid)
- Drag-and-drop Kanban with keyboard alternatives
- Light theme toggle persisted per user
- Real-time updates (SSE or websockets)
- Audit log export and analytics charts

## License

Private / educational use unless you add your own license.
