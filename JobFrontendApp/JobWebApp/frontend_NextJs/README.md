# JobHook — Next.js Frontend

The **Next.js** version of the JobHook job portal. It is a feature-for-feature port of the React
app in [`../frontend_ReactJs`](../frontend_ReactJs) (and a sibling of
[`../frontend_Angular`](../frontend_Angular)), and it talks to the **same Spring Boot backend**
(`JobBackendApp/backend_springBoot`).

> Next.js **16** (App Router, Turbopack) · React 19 · TypeScript · Mantine 8 · Zustand ·
> Tailwind CSS v4 · server-side route protection with `proxy.ts`

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Prerequisites](#2-prerequisites)
3. [Scripts](#3-scripts)
4. [Configuration (.env)](#4-configuration-env)
5. [Dependencies — what each one is for](#5-dependencies--what-each-one-is-for)
6. [Project structure](#6-project-structure)
7. [Architecture](#7-architecture)
8. [Routing & role-based access](#8-routing--role-based-access)
9. [Key user flows](#9-key-user-flows)
10. [React (CRA) → Next.js mapping](#10-react-cra--nextjs-mapping)
11. [Styling & theming](#11-styling--theming)
12. [Building & deploying](#12-building--deploying)
13. [Troubleshooting](#13-troubleshooting)
14. [How to add a new page](#14-how-to-add-a-new-page)

---

## 1. Quick start

```bash
cd frontend_NextJs
npm install
npm run dev
```

Open **http://localhost:3000**. By default the app calls the hosted backend
(`https://job-portal-project-1-f7oc.onrender.com`). The free Render instance sleeps when idle,
so the **first request can take 30–60 seconds**.

To use a local backend: copy `.env.example` to `.env.local` and set
`NEXT_PUBLIC_API_URL=http://localhost:8080` (see [section 4](#4-configuration-env)).

---

## 2. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Node.js | **20.9+** (required by Next.js 16) | `node -v` |
| npm | 10+ (ships with Node) | `npm -v` |
| Backend | Spring Boot API from `JobBackendApp/backend_springBoot` (local or hosted) | — |

No global CLI is needed — everything runs through the npm scripts.

---

## 3. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with Fast Refresh at http://localhost:3000 (Turbopack). Pages compile on first visit, so the first load of each route is slower. |
| `npm run build` | Production build into `.next/` (type-checks the whole project) |
| `npm start` | Runs the production build (`npm run build` first) |
| `npm run lint` | ESLint with the Next.js + React Hooks rules |

Run on another port: `npm run dev -- --port 3001`.

---

## 4. Configuration (.env)

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://job-portal-project-1-f7oc.onrender.com` | Base URL of the Spring Boot API |

```bash
cp .env.example .env.local      # Windows: copy .env.example .env.local
```

* `.env.local` is git-ignored; `.env.example` is the committed template.
* Variables prefixed with `NEXT_PUBLIC_` are **inlined into the browser bundle at build time**,
  so after changing it restart `npm run dev`, or rebuild for production.
* CORS: the backend controllers use `@CrossOrigin` (all origins), so port 3000 works out of the box.

---

## 5. Dependencies — what each one is for

### Runtime (`dependencies`)

| Package | Purpose in this app | Same as React app? |
|---|---|---|
| `next` | Framework: App Router, file-based routing, SSR, `proxy.ts`, image optimisation, fonts | replaces `react-scripts` + `react-router-dom` |
| `react`, `react-dom` | UI library (v19) | yes (v18 there) |
| `@mantine/core`, `@mantine/hooks` | UI components (inputs, menus, modals, drawers, tabs) and hooks | yes (v7 → v8) |
| `@mantine/form` | Form state & validation (apply, post job, profile forms) | yes |
| `@mantine/dates` + `dayjs` | Date / month pickers (interview date, experience, certificates) | yes |
| `@mantine/notifications` | Toast notifications | yes |
| `@mantine/carousel` + `embla-carousel(-react)` | Job-category carousel on the home page | yes |
| `@mantine/tiptap` + `@tiptap/*` | Rich-text editor for job descriptions | yes (Tiptap v2 → v3) |
| `@tabler/icons-react` | Icons (tree-shaken via `optimizePackageImports`) | yes |
| `axios` | HTTP client with interceptors | yes |
| `jwt-decode` | Decode the JWT to read `id`, `name`, `accountType`, `profileId` | yes |
| `zustand` | Global state (session, profile, filters, sort, loading overlay) | replaces Redux Toolkit |
| `dompurify` | Sanitise job-description HTML before rendering | yes |
| `aos` | Scroll animations (`data-aos="fade-up"`) | yes |
| `react-fast-marquee` | Scrolling company logos | yes |

### Development (`devDependencies`)

| Package | Purpose |
|---|---|
| `typescript`, `@types/*` | Type checking (strict mode) |
| `tailwindcss`, `@tailwindcss/postcss` | Utility CSS v4 (configured in `globals.css`, wired via `postcss.config.mjs`) |
| `eslint`, `eslint-config-next` | Linting incl. React Hooks / React Compiler rules |

### Not needed any more (vs. the React app)

| React package | Why |
|---|---|
| `react-router-dom` | Next.js file-based routing (`src/app/**/page.tsx`) |
| `@reduxjs/toolkit`, `react-redux` | Zustand store (`src/store`) — smaller, no boilerplate |
| `react-scripts`, `web-vitals`, `cross-env` | Next.js CLI handles build/dev/env |
| `@testing-library/*` | Not set up yet (see notes in section 13) |

---

## 6. Project structure

```
frontend_NextJs/
├── next.config.ts          # Next.js config (package-import optimisation)
├── postcss.config.mjs      # Tailwind v4 PostCSS plugin
├── eslint.config.mjs       # ESLint flat config (next/core-web-vitals + typescript)
├── tsconfig.json           # strict TS, "@/*" -> "src/*" path alias
├── .env.example            # environment template
├── public/                 # static assets (logos, avatars, banner, category images)
└── src/
    ├── proxy.ts            # server-side route protection (Next 16 "proxy", formerly middleware)
    ├── app/                # ROUTES (App Router)
    │   ├── layout.tsx          # <html>, fonts, Mantine + store providers; reads token/theme cookies
    │   ├── globals.css         # Tailwind + Mantine layers, theme tokens, light/dark variables
    │   ├── not-found.tsx       # 404
    │   ├── error.tsx           # error boundary
    │   ├── (auth)/             # route group WITHOUT header/footer
    │   │   ├── layout.tsx          # sliding Login | Brand | Sign-up screen (shared by both pages)
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   └── (main)/             # route group WITH header/footer
    │       ├── layout.tsx
    │       ├── page.tsx            # home
    │       ├── find-jobs/  jobs/[id]/  apply-job/[id]/  company/[name]/  job-history/
    │       ├── find-talent/  talent-profile/[id]/  post-job/[id]/  posted-jobs/[id]/
    │       ├── profile/
    │       └── unauthorized/
    ├── components/         # UI, grouped by feature
    │   ├── providers/          # AppProviders (Mantine, notifications, AOS, 401 handler, overlay)
    │   ├── header/ footer/ landing/ auth/
    │   ├── jobs/               # JobCard, JobDescription, FindJobsView, JobDetailView, ApplyJobView, ...
    │   ├── talent/             # TalentCard, FindTalentView, TalentProfileView
    │   ├── posted-jobs/        # PostJobView, PostedJobsView (employer dashboard)
    │   ├── profile/            # ProfileView + editable sections
    │   └── shared/             # SelectInput, MultiInput, FilterBar, Sort, TextEditor, CompanyLogo, ...
    ├── store/              # Zustand store + context provider
    ├── hooks/              # useApi (data loading with stale-response protection)
    ├── lib/
    │   ├── api/                # axios client + one service object per backend resource
    │   ├── auth/session.ts     # JWT decode, cookie/localStorage persistence (shared with proxy.ts)
    │   ├── utils/              # dates, files/base64, filtering & sorting, validation
    │   └── notifications.tsx   # success/error toast helpers
    ├── config/routes.ts    # role rules for routes + nav links (single source of truth)
    ├── data/               # static option lists & landing-page content
    └── types/              # TypeScript models: Job, Applicant, Profile, JWT claims, filters
```

**Pattern used for every page:** `app/**/page.tsx` is a small **server component** that sets the
`<title>` (`metadata`) and reads the route params, then renders a **client component** "view"
from `components/` that does the interactive work:

```tsx
// src/app/(main)/jobs/[id]/page.tsx
export const metadata: Metadata = { title: 'Job Details' };

export default async function JobPage({ params }: PageProps<'/jobs/[id]'>) {
  const { id } = await params;          // params is a Promise in Next 15+
  return <JobDetailView id={id} />;     // 'use client' component
}
```

---

## 7. Architecture

### 7.1 Authentication & session

1. **Login** — `POST /auth/login` returns `{ jwt }`. The store's `login(jwt)` decodes it and saves it
   in a **`token` cookie** (for the server) and in `localStorage` (same keys as the React app:
   `token`, `user`, `accountType`).
2. **Server** — on every request `src/proxy.ts` reads the cookie and redirects before the page
   renders (see section 8). The root `layout.tsx` also reads the cookie, so the first HTML already
   shows the logged-in header — no "logged out" flash.
3. **API calls** — the axios request interceptor adds `Authorization: Bearer <token>`.
4. **401** — the response interceptor calls a handler registered in `AppProviders` that logs the
   user out and navigates to `/login`.

> The cookie is set by the browser (not `HttpOnly`) because the backend returns the JWT in the
> response body. For stricter security, a Next.js Route Handler could proxy `/auth/login` and set
> an `HttpOnly` cookie — the proxy check would stay the same.

### 7.2 State management (Zustand)

`src/store/app-store.ts` holds one store with the same slices as the React Redux store:

| State | React slice | Actions |
|---|---|---|
| `token`, `user` | JwtSlice + UserSlice | `login`, `logout` |
| `profile` | ProfileSlice | `loadProfile`, `updateProfile` (optimistic, rolls back on error), `toggleSavedJob` |
| `filter` | FilterSlice | `updateFilter`, `resetFilter` |
| `sort` | SortSlice | `setSort` |
| `pending` | OverlaySlice | `track(promise)` — shows the global loading overlay while it runs |

The store is created **per request** inside `AppStoreProvider` (the pattern Zustand recommends for
Next.js), so server renders never share state between users. Read it with a selector:

```ts
const user = useAppStore((s) => s.user);
const updateProfile = useAppStore((s) => s.updateProfile);
```

### 7.3 Data fetching

Pages fetch on the client (the API needs the user's token) through `lib/api/services.ts`. The
`useApi` hook wraps the common pattern and ignores stale responses when params change:

```ts
const { data: job, reload } = useApi(() => jobApi.getJob(id), [id], { overlay: true });
```

| Service | Endpoints |
|---|---|
| `authApi` | `POST /auth/login` |
| `userApi` | `POST /users/register`, `POST /users/sendOtp/{email}`, `GET /users/verifyOtp/{email}/{otp}`, `POST /users/changePass` |
| `jobApi` | `POST /jobs/post`, `GET /jobs/getAll`, `GET /jobs/get/{id}`, `POST /jobs/apply/{id}`, `GET /jobs/history/{id}/{status}`, `GET /jobs/postedBy/{id}`, `POST /jobs/changeAppStatus` |
| `profileApi` | `GET /profiles/get/{id}`, `GET /profiles/getAll`, `PUT /profiles/update` |
| `notificationApi` | `GET /notification/get/{userId}`, `PUT /notification/read/{id}` |

### 7.4 Server vs client components

* **Server components** (no `'use client'`): route `page.tsx` files, layouts, `Footer`, `Working`,
  `ErrorCard`, `ProfileItems` — static markup, zero client JS.
* **Client components** (`'use client'`): anything using state, Mantine interactive components,
  the store, or browser APIs.

---

## 8. Routing & role-based access

Rules live in **`src/config/routes.ts`** and are enforced in **`src/proxy.ts`**:

| Path | Who can open it | Otherwise |
|---|---|---|
| `/` | everyone | — |
| `/login`, `/signup` | guests only | logged in → `/` |
| `/find-jobs`, `/jobs/[id]`, `/apply-job/[id]`, `/company/[name]`, `/job-history` | APPLICANT, ADMIN | no session → `/login`, wrong role → `/unauthorized` |
| `/find-talent`, `/talent-profile/[id]`, `/post-job/[id]`, `/posted-jobs/[id]` | EMPLOYER, ADMIN | same |
| `/profile` | all roles | no session → `/login` |

* `/post-job/0` creates a job; `/post-job/12` edits job 12.
* `/posted-jobs/0` (the nav link) opens the newest active job.
* `/find-jobs?jobTitle=Developer&jobType=Full%20Time` pre-fills the filters — the home-page search uses this.
* The header shows only the links your role can open.
* Route groups `(auth)` and `(main)` decide whether the header/footer are shown; the parentheses
  don't appear in the URL. Because `/login` and `/signup` share the `(auth)` layout, the sliding
  panel stays mounted and animates between them.

---

## 9. Key user flows

| Flow | How it works |
|---|---|
| **Login / Signup** | Mantine forms with the same validation rules as React (`lib/utils/validation.ts`). |
| **Forgot password** | Modal: email → Send OTP → 6-digit PIN (auto-verifies) → 60 s resend timer → new password. |
| **Find jobs** | All jobs load once; filtering and sorting run in memory (`lib/utils/job-filtering.ts`). |
| **Save job** | Bookmark → `toggleSavedJob` → optimistic `PUT /profiles/update`. |
| **Apply** | Form → preview → resume PDF read as Base64 (prefix stripped) → `POST /jobs/apply/{id}` → `/job-history`. |
| **Post / edit job** | Creatable selects, tags, Tiptap editor → `POST /jobs/post` with `ACTIVE` (validated) or `DRAFT`. |
| **Applicant pipeline** | Posted Jobs → Applicants → *Schedule* (date + time) → Invited → *Accept / Reject*. Each change calls `POST /jobs/changeAppStatus` and reloads the list. |
| **Profile** | Info, about, skills, experience, certifications and picture all update the full profile. |
| **Theme** | Profile menu → Light/Dark. Saved in a `theme` cookie so the server renders the right theme on reload. |

---

## 10. React (CRA) → Next.js mapping

| React (`frontend_ReactJs/src`) | Next.js (`frontend_NextJs/src`) |
|---|---|
| `index.tsx`, `App.tsx` | `app/layout.tsx` + `components/providers/app-providers.tsx` |
| `Pages/AppRoutes.tsx` | the `app/` folder structure itself |
| `Pages/*Page.tsx` | `app/(main)/**/page.tsx` + a `*View.tsx` in `components/` |
| `Services/ProtectedRoute.tsx`, `PublicRoute.tsx` | `proxy.ts` + `config/routes.ts` |
| `Interceptor/AxiosInterceptor.tsx` | `lib/api/client.ts` |
| `Services/*Service.tsx` | `lib/api/services.ts` |
| `Services/NotificationService.tsx` | `lib/notifications.tsx` |
| `Services/Utilities.tsx`, `FormValidation.tsx` | `lib/utils/*` |
| `Slices/*`, `Store.tsx` | `store/app-store.ts` + `store/app-store-provider.tsx` |
| `theme/themeUtils.ts` | `lib/auth/session.ts` (`persistTheme`) + `ProfileMenu` |
| `Data/*` | `data/*` |
| `Components/Header/*`, `Footer/*`, `LandingPage/*`, `SignUpLogin/*` | `components/header`, `footer`, `landing`, `auth` |
| `Components/FindJobs/*`, `JobDesc/*`, `ApplyJob/*`, `JobHistory/*`, `CompanyProfile/*` | `components/jobs/*` |
| `Components/FindTalent/*`, `TalentProfile/*` | `components/talent/*` |
| `Components/PostJob/*`, `PostedJob/*` | `components/posted-jobs/*` |
| `Components/Profile/*` | `components/profile/*` |
| `PostJob/SelectInput` + `Profile/SelectInput` | one `components/shared/SelectInput.tsx` |
| `FindJobs/SearchBar` + `FindTalent/SearchBar` | one `components/shared/FilterBar.tsx` |
| `<Link to>` / `useNavigate()` / `useParams()` / `useLocation()` | `<Link href>` / `useRouter()` / page `params` prop / `usePathname()` |
| `useSelector` / `dispatch(action)` | `useAppStore(selector)` / call the action |

### Improvements over the React version

* Route protection runs on the **server** (no flash of a protected page before redirecting).
* The first render already knows the user and the theme (cookies read in the root layout).
* Expired or invalid tokens are discarded; the 401 handler is registered once.
* Profile updates roll back with an error toast if the request fails.
* Status changes refresh the list instead of reloading the whole page.
* Interview cards show the real scheduled time (React showed a hard-coded date).
* Company page Jobs/Employees tabs show real data for that company.
* Home search filters are in the URL, so searches can be shared or bookmarked.
* `next/image` for static images, `next/font` for self-hosted Poppins (no layout shift).
* Exact image file names (`/Working/Apply for job.png`), so assets work on case-sensitive Linux hosts.
* Missing company logos fall back to a default image instead of a broken icon.

---

## 11. Styling & theming

* **Tailwind CSS v4** is configured in `src/app/globals.css` (`@theme { … }`), not a JS config file:
  `mine-shaft` + `bright-sun` colour scales, breakpoints and animations.
* Breakpoints match React (`xsm 350`, `xs 476`, `sm 640`, `md 768`, `bs 900`, `lg 1024`, `xl 1280`, `2xl 1536`).
  React's custom `md-mx:` classes are written as Tailwind's built-in **`max-md:`** variants.
* **Mantine + Tailwind together:** Mantine's styles are imported as *layered* CSS into a `mantine`
  cascade layer placed before Tailwind's `utilities`, so Tailwind classes on Mantine components win
  without `!important` hacks (`@layer theme, base, mantine, components, utilities;`).
* **Light/dark:** `mine-shaft-*` colours are CSS variables; `html.light-theme` swaps the ramp.
  Mantine's own colour scheme is switched at the same time.
* Important modifier in Tailwind v4 is a suffix: `text-xs!` (React used `!text-xs`).

---

## 12. Building & deploying

```bash
npm run build
npm start          # serves the build on http://localhost:3000
```

The app uses server features (proxy, cookies in layouts), so deploy it as a **Node.js app**, not a
static export:

* **Vercel** — import the repo, set the root directory to `JobFrontendApp/JobWebApp/frontend_NextJs`,
  add `NEXT_PUBLIC_API_URL` in the project's environment variables, deploy.
* **Any Node host / VM / Docker** — `npm ci && npm run build && npm start` (set `PORT` to change the port).
  For Docker, add `output: 'standalone'` to `next.config.ts` and run `node .next/standalone/server.js`.
* **AWS Amplify / Netlify** — both support Next.js App Router with server rendering.

Set `NEXT_PUBLIC_API_URL` **before** building — it is baked into the client bundle. If the site is
served over HTTPS the API must be HTTPS too (browsers block mixed content).

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| `You are using Node.js … Next.js requires …` | Upgrade Node to 20.9+. |
| First load of a page is slow in dev | Normal — Turbopack compiles each route on first visit. |
| First API call takes a long time | The free Render backend is waking up — wait ~1 minute or run the backend locally. |
| Changed `NEXT_PUBLIC_API_URL` but nothing changed | Restart `npm run dev` / rebuild — the value is inlined at build time. |
| Redirected to `/login` although logged in | The `token` cookie expired or was cleared — log in again. |
| Hydration warning in the console | Usually a browser extension editing the page; check in a private window. |
| Port 3000 is busy | `npm run dev -- --port 3001` |

> **Testing:** there is no test runner configured yet. Recommended next step: Vitest + React Testing
> Library for components, and Playwright for end-to-end flows (login → apply → schedule).

---

## 14. How to add a new page

1. Create the view as a client component, e.g. `src/components/jobs/SavedJobsView.tsx`:
   ```tsx
   'use client';
   export default function SavedJobsView() {
     const profile = useAppStore((s) => s.profile);
     return <div className="min-h-[90vh] p-4">…</div>;
   }
   ```
2. Add the route file `src/app/(main)/saved-jobs/page.tsx`:
   ```tsx
   export const metadata: Metadata = { title: 'Saved Jobs' };
   export default function SavedJobsPage() {
     return <SavedJobsView />;
   }
   ```
3. Protect it by adding `{ prefix: '/saved-jobs', roles: APPLICANT_ROLES }` to
   `PROTECTED_ROUTES` in `src/config/routes.ts`.
4. Add it to `NAV_LINKS` in the same file to show it in the header.
5. Need data? Add a method to `lib/api/services.ts` and load it with `useApi(...)`.
