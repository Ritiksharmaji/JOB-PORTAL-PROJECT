# JobHook — Angular Frontend

The **Angular** version of the JobHook job portal. It is a feature-for-feature port of the
React app in [`../frontend_ReactJs`](../frontend_ReactJs) and talks to the **same Spring Boot
backend** (`JobBackendApp/backend_springBoot`), so the two frontends are interchangeable.

> Angular **21** · standalone components · Signals · zoneless change detection ·
> Reactive Forms · functional guards & interceptors · lazy-loaded routes · Tailwind CSS v4 · Vitest

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Prerequisites](#2-prerequisites)
3. [Scripts](#3-scripts)
4. [Configuration (API URL / environments)](#4-configuration-api-url--environments)
5. [Dependencies — what each one is for](#5-dependencies--what-each-one-is-for)
6. [Project structure](#6-project-structure)
7. [Architecture](#7-architecture)
8. [Routing & role-based access](#8-routing--role-based-access)
9. [Key user flows](#9-key-user-flows)
10. [React → Angular mapping](#10-react--angular-mapping)
11. [Styling & theming](#11-styling--theming)
12. [Testing](#12-testing)
13. [Building & deploying](#13-building--deploying)
14. [Troubleshooting](#14-troubleshooting)
15. [How to add a new page](#15-how-to-add-a-new-page)

---

## 1. Quick start

```bash
cd frontend_Angular
npm install
npm start
```

Open **http://localhost:4200**. By default the app uses the hosted backend
(`https://job-portal-project-1-f7oc.onrender.com`). The free Render instance sleeps when idle,
so the **first request can take 30–60 seconds**.

To use a local backend instead, start Spring Boot on port 8080 and change `apiUrl` in
`src/environments/environment.development.ts` (see [section 4](#4-configuration-api-url--environments)).

---

## 2. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Node.js | **20.19+**, **22.12+** or **24+** (required by Angular 21) | `node -v` |
| npm | 10+ (ships with Node) | `npm -v` |
| Angular CLI (optional) | 21.x — not needed globally; use `npx ng …` or the npm scripts | `npx ng version` |
| Backend | Spring Boot API from `JobBackendApp/backend_springBoot` (local or hosted) | — |

> **Why Angular 21 and not 22?** Angular 22 requires Node ≥ 22.22. Angular 21 is the current
> LTS line and runs on the Node versions above. Upgrading later is one command:
> `npx ng update @angular/core@22 @angular/cli@22`.

Recommended VS Code extension: **Angular Language Service** (`Angular.ng-template`), already
suggested in `.vscode/extensions.json`.

---

## 3. Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server with live reload at http://localhost:4200 (uses `environment.development.ts`) |
| `npm run build` | Production build to `dist/job-portal-angular/browser` (minified, hashed, uses `environment.ts`) |
| `npm run build:dev` | Unminified build with source maps |
| `npm run watch` | Rebuilds on every file change (development config) |
| `npm test` | Unit tests with **Vitest** in watch mode |
| `npm run test:ci` | Unit tests once (for CI pipelines) |
| `npm run format` | Formats `src/` with Prettier (`.prettierrc`) |

Run on another port: `npm start -- --port 3001`.

---

## 4. Configuration (API URL / environments)

```
src/environments/
├── environment.ts               # production  → used by `npm run build`
└── environment.development.ts   # development → used by `npm start`
```

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'https://job-portal-project-1-f7oc.onrender.com',
  // apiUrl: 'http://localhost:8080',
};
```

`angular.json` swaps the file at build time (`fileReplacements`), so **no code changes** are
needed between environments; every API service builds its URLs from `environment.apiUrl`.

CORS: the backend controllers use `@CrossOrigin` (all origins), so port 4200 works out of the box.

---

## 5. Dependencies — what each one is for

### Runtime (`dependencies`)

| Package | Purpose in this app | React app equivalent |
|---|---|---|
| `@angular/core` | Components, DI, **Signals**, zoneless change detection | `react` |
| `@angular/common` | `HttpClient`, `Location`, built-in pipes (`number`) | `axios` (HTTP part) |
| `@angular/router` | Routing, lazy loading, guards, route-param → `input()` binding | `react-router-dom` |
| `@angular/forms` | Reactive Forms + `ControlValueAccessor` for custom inputs | `@mantine/form` |
| `@angular/platform-browser` | Bootstraps the app in the browser, `DomSanitizer` | `react-dom` |
| `@angular/compiler` | Template compiler (used at build time) | — |
| `rxjs` | Observables for HTTP, `switchMap` for param-driven loading | — |
| `tslib` | TypeScript runtime helpers | — |
| `jwt-decode` | Decode the JWT to read `id`, `name`, `accountType`, `profileId` | same |
| `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit` | Rich-text editor for job descriptions | `@mantine/tiptap` + `@tiptap/react` |
| `@tiptap/extension-highlight`, `-text-align`, `-subscript`, `-superscript` | Extra editor toolbar features | same |
| `dompurify` | Sanitises job-description HTML before rendering | same |
| `aos` | Scroll animations (`data-aos="fade-up"` …) | same |

### Development (`devDependencies`)

| Package | Purpose |
|---|---|
| `@angular/cli`, `@angular/build` | `ng serve` / `ng build` / `ng test` (esbuild + Vite under the hood) |
| `@angular/compiler-cli` | Ahead-of-time (AOT) template compilation and type-checking |
| `typescript` | Language (strict mode enabled) |
| `tailwindcss`, `@tailwindcss/postcss`, `postcss` | Utility CSS (v4), wired in through `.postcssrc.json` |
| `vitest`, `jsdom` | Unit test runner and DOM environment (Angular 21 default) |
| `@types/aos` | Type definitions for AOS |
| `prettier` | Code formatting |

### Not needed in Angular (and why)

| React package | Replaced by |
|---|---|
| `@reduxjs/toolkit`, `react-redux` | Signal-based stores in `core/state` (built into Angular) |
| `@mantine/*`, `@emotion/react` | Small in-house UI kit in `shared/ui` + Tailwind |
| `@tabler/icons-react` | `shared/ui/icon` — inline SVGs for only the ~70 icons used (no 700 KB icon font) |
| `react-fast-marquee`, `@mantine/carousel`, `embla-carousel-react` | Pure CSS marquee + scroll-snap carousel |
| `@mantine/notifications`, `react-hot-toast` | `ToastService` + `<app-toast-container>` |
| `@mantine/dates`, `dayjs` | Native `<input type="date|time|month">` + `core/utils/date.utils.ts` |
| `react-scripts` | Angular CLI (`@angular/build`) |

> `.npmrc` sets `legacy-peer-deps=true`. npm 10 hits an internal bug
> (`Cannot read properties of null (reading 'edgesOut')`) when resolving the Angular 21 + Vitest
> peer tree; this flag avoids it and does not change which versions get installed.

---

## 6. Project structure

```
frontend_Angular/
├── angular.json            # CLI workspace config (build, serve, test, budgets, env replacement)
├── package.json            # scripts + dependencies
├── .postcssrc.json         # enables Tailwind v4 through PostCSS
├── .npmrc                  # legacy-peer-deps (see above)
├── tsconfig*.json          # strict TypeScript + strict template checking
├── public/                 # static assets copied as-is (logos, avatars, banners, category images)
└── src/
    ├── index.html          # HTML shell (Poppins font, <app-root>)
    ├── main.ts             # bootstrapApplication(App, appConfig)
    ├── styles.css          # Tailwind import, theme tokens, light/dark variables, component classes
    ├── environments/       # apiUrl per environment
    └── app/
        ├── app.ts          # root component: header/footer, router-outlet, toasts, loading overlay
        ├── app.config.ts   # providers: router, HttpClient + interceptors
        ├── app.routes.ts   # all routes (lazy-loaded) + guards + role data
        │
        ├── core/           # app-wide, non-visual singletons
        │   ├── constants/      # localStorage keys, role groups
        │   ├── models/         # TypeScript interfaces: Job, Applicant, Profile, JWT claims, filters
        │   ├── services/
        │   │   ├── api/        # one service per backend resource (auth, user, job, profile, notification)
        │   │   ├── toast.service.ts
        │   │   └── theme.service.ts
        │   ├── state/          # signal stores: session, profile, filter, sort, loading
        │   ├── interceptors/   # auth header + 401 handling
        │   ├── guards/         # authGuard (login + roles), guestGuard
        │   └── utils/          # dates, files/base64, http errors, validators, localStorage
        │
        ├── shared/         # reusable building blocks (no feature logic)
        │   ├── ui/             # icon, modal, drawer, tabs, creatable-select, tags-input,
        │   │                   # range-slider, multi-select-filter, sort-menu, rich-text-editor,
        │   │                   # toast-container, loading-overlay
        │   ├── components/     # job-card, talent-card, job-description, profile-sections
        │   ├── directives/     # click-outside, img-fallback
        │   └── pipes/          # timeAgo, monthYear, interviewTime, picture, sanitizeHtml
        │
        ├── layout/         # header (nav, profile menu, notifications, mobile drawer), footer
        │
        ├── features/       # one folder per route/page (each lazy-loaded)
        │   ├── home/           # landing page + sections/
        │   ├── auth/           # login, signup, reset-password (OTP)
        │   ├── find-jobs/      # filters, sorting, job list (+ job-filtering.ts pure functions)
        │   ├── job-detail/     # job description + recommended jobs
        │   ├── apply-job/      # application form (preview → submit)
        │   ├── company/        # company page (about / jobs / employees)
        │   ├── job-history/    # applied / saved / offered / in-progress tabs
        │   ├── find-talent/    # talent search
        │   ├── talent-profile/ # candidate profile (employer view)
        │   ├── post-job/       # create / edit job with rich-text editor
        │   ├── posted-jobs/    # employer dashboard + applicant pipeline
        │   ├── profile/        # own editable profile + sections/
        │   └── errors/         # 404 and 403 pages
        │
        └── data/           # static option lists & landing-page content
```

**Naming:** this project follows the current Angular style guide, where files are named after
what they contain (`job-card.ts` exports `JobCard`) without the old `.component.ts` suffix.
Services keep the `.service.ts` suffix and stores live under `core/state`.

---

## 7. Architecture

### 7.1 Layers

```
features/  ──uses──▶  shared/  ──uses──▶  core/
   │                                       ▲
   └───────────────────uses────────────────┘
```

* **core** — singletons (`providedIn: 'root'`): API services, stores, guards, interceptors. No UI.
* **shared** — presentational components, pipes and directives used by several features.
* **features** — route-level pages. A feature never imports from another feature.

### 7.2 State management (Signals)

Each React Redux slice became a small injectable store that exposes **read-only signals**:

| Store (`core/state`) | Holds | React slice |
|---|---|---|
| `SessionStore` | raw JWT + decoded user, `isLoggedIn`, `accountType`, `hasRole()` | `JwtSlice` + `UserSlice` |
| `ProfileStore` | logged-in user's profile; **auto-loads** when `profileId` changes; `update()` is optimistic with rollback | `ProfileSlice` |
| `FilterStore` | Find Jobs / Find Talent criteria, `hasActiveFilters` | `FilterSlice` |
| `SortStore` | current sort option | `SortSlice` |
| `LoadingStore` | global overlay; counter-based so parallel requests don't hide it early; `track()` RxJS operator | `OverlaySlice` |

Components read them directly in templates (`profileStore.profile()`), and derived data uses
`computed()` — e.g. the visible job list is `computed(() => sortJobs(filterJobs(jobs, filter), sort))`,
so filtering and sorting recompute automatically.

Session persistence uses the **same localStorage keys as the React app** (`token`, `user`,
`accountType`, `theme`). On start-up the token is decoded again and dropped if it is expired or malformed.

### 7.3 HTTP layer

* `core/services/api/*` — one service per backend resource, each method returns a typed `Observable`.
* `authInterceptor` adds `Authorization: Bearer <token>` to every request.
* `unauthorizedInterceptor` — on **401** it clears the session and navigates to `/login`.
* Errors from the backend come as `{ errorMessage }`; `getErrorMessage()` extracts it for toasts.

| Service | Endpoints |
|---|---|
| `AuthApiService` | `POST /auth/login` → `{ jwt }` |
| `UserApiService` | `POST /users/register`, `POST /users/sendOtp/{email}`, `GET /users/verifyOtp/{email}/{otp}`, `POST /users/changePass` |
| `JobApiService` | `POST /jobs/post`, `GET /jobs/getAll`, `GET /jobs/get/{id}`, `POST /jobs/apply/{id}`, `GET /jobs/history/{id}/{status}`, `GET /jobs/postedBy/{id}`, `POST /jobs/changeAppStatus` |
| `ProfileApiService` | `GET /profiles/get/{id}`, `GET /profiles/getAll`, `PUT /profiles/update` |
| `NotificationApiService` | `GET /notification/get/{userId}`, `PUT /notification/read/{id}` |

### 7.4 Forms

* **Reactive Forms** (`NonNullableFormBuilder`) with validators in `core/utils/validators.ts`
  (same email/password rules as React).
* Custom inputs implement **`ControlValueAccessor`**, so they work with `formControlName` like
  native inputs: `CreatableSelect`, `TagsInput`, `RichTextEditor`.
* Errors show once a field is dirty/touched or after the first submit attempt.

### 7.5 Change detection

The app is **zoneless** (the Angular 21 default; no `zone.js`) and every component uses
`ChangeDetectionStrategy.OnPush`. Views update when a signal they read changes or a template
event fires — that's why all mutable component state is held in `signal()`s.

---

## 8. Routing & role-based access

All pages are lazy-loaded (`loadComponent`), so each one ships as its own chunk.

| Path | Page | Who can open it |
|---|---|---|
| `/` | Home | everyone |
| `/login`, `/signup` | Auth (sliding panel) | **guests only** (`guestGuard`) |
| `/find-jobs` | Find Jobs | APPLICANT, ADMIN |
| `/jobs/:id` | Job details | APPLICANT, ADMIN |
| `/apply-job/:id` | Apply | APPLICANT, ADMIN |
| `/company/:name` | Company | APPLICANT, ADMIN |
| `/job-history` | Job History | APPLICANT, ADMIN |
| `/find-talent` | Find Talent | EMPLOYER, ADMIN |
| `/talent-profile/:id` | Candidate profile | EMPLOYER, ADMIN |
| `/post-job/:id` | Post (`0`) / edit job | EMPLOYER, ADMIN |
| `/posted-jobs/:id` | Employer dashboard (`0` = newest active job) | EMPLOYER, ADMIN |
| `/profile` | Own profile | all roles |
| `/unauthorized` | 403 page | everyone |
| `**` | 404 page | everyone |

* `authGuard` — not logged in → `/login`; role not in `route.data.roles` → `/unauthorized`.
* Route params are bound straight to component inputs (`withComponentInputBinding()`), e.g.
  `readonly id = input.required<string>()` in `JobDetailPage`.
* `/login` and `/signup` share **one** route config (a `UrlMatcher`), so Angular reuses the same
  `AuthPage` instance and the sliding animation plays when switching between them.
* The header only shows the nav links your role can open.

---

## 9. Key user flows

| Flow | How it works |
|---|---|
| **Login** | `AuthApiService.login` → `SessionStore.login(jwt)` decodes the token → `ProfileStore` notices the new `profileId` and loads the profile → redirect to `/`. |
| **Signup** | Reactive form with password-strength + match validators → `POST /users/register` → slide to login. |
| **Forgot password** | Modal: send OTP → 6-box OTP input (auto-verifies, supports paste, 60 s resend timer) → new password. |
| **Find jobs** | Load all jobs once → filter (`job-filtering.ts`) and sort in memory via `computed()`. The hero search on the home page pre-fills the filters. |
| **Save job** | Bookmark toggles `savedJobs` through `ProfileStore.update()` (optimistic, rolls back on error). |
| **Apply** | Form → preview → resume PDF read as Base64 (prefix stripped) → `POST /jobs/apply/{id}` → `/job-history`. |
| **Post / edit job** | Creatable selects, tags input, Tiptap editor → `POST /jobs/post` with `ACTIVE` (validated) or `DRAFT`. |
| **Applicant pipeline** | Posted Jobs tabs: Applicants → *Schedule* (date + time) → Invited → *Accept/Reject* → Offered/Rejected. Each change calls `POST /jobs/changeAppStatus` and reloads the list (no full page reload). |
| **Profile editing** | Info, about, skills, experience, certifications and picture each build the full profile and call `PUT /profiles/update`. |
| **Theme** | Profile menu → Light/Dark switch. `ThemeService` toggles `.light-theme` on `<html>` and stores the choice. |
| **Rich text safety** | Job descriptions are sanitised with DOMPurify (`sanitizeHtml` pipe) before `[innerHTML]`. |

---

## 10. React → Angular mapping

Use this table to find the Angular counterpart of any React file.

| React (`frontend_ReactJs/src`) | Angular (`frontend_Angular/src/app`) |
|---|---|
| `index.tsx`, `App.tsx` | `main.ts`, `app.ts`, `app.config.ts` |
| `Pages/AppRoutes.tsx` | `app.routes.ts` |
| `Services/ProtectedRoute.tsx`, `PublicRoute.tsx` | `core/guards/auth.guards.ts` |
| `Interceptor/AxiosInterceptor.tsx` | `core/interceptors/*.ts` |
| `Services/*Service.tsx` (API) | `core/services/api/*.service.ts` |
| `Services/NotificationService.tsx` | `core/services/toast.service.ts` |
| `Services/Utilities.tsx` | `core/utils/date.utils.ts`, `file.utils.ts` + `shared/pipes` |
| `Services/FormValidation.tsx` | `core/utils/validators.ts` |
| `Slices/*.tsx`, `Store.tsx` | `core/state/*.store.ts` |
| `theme/themeUtils.ts` | `core/services/theme.service.ts` |
| `Data/*.tsx` | `data/*.ts` |
| `Components/Header/*` | `layout/header/*` |
| `Components/Footer/Footer.tsx` | `layout/footer/footer.ts` |
| `Components/LandingPage/*` | `features/home/sections/*` |
| `Components/SignUpLogin/*`, `Pages/SignUpPage.tsx` | `features/auth/*` |
| `Components/FindJobs/*` | `features/find-jobs/*`, `shared/components/job-card`, `shared/ui/multi-select-filter`, `shared/ui/sort-menu` |
| `Components/JobDesc/*` | `shared/components/job-description`, `features/job-detail` |
| `Components/ApplyJob/*` | `features/apply-job/*` |
| `Components/JobHistory/*` | `features/job-history` (re-uses `JobCard` with a `variant`) |
| `Components/FindTalent/*` | `features/find-talent/*`, `shared/components/talent-card` |
| `Components/TalentProfile/*` | `features/talent-profile`, `shared/components/profile-sections` |
| `Components/CompanyProfile/*` | `features/company/company-page.ts` |
| `Components/PostJob/*` | `features/post-job`, `shared/ui/creatable-select`, `shared/ui/rich-text-editor` |
| `Components/PostedJob/*` | `features/posted-jobs/*` |
| `Components/Profile/*` | `features/profile/*` |
| `useState` | `signal()` |
| `useEffect` on props/params | `computed()`, `effect()`, or `toObservable(input).pipe(switchMap(...))` |
| `useSelector` / `dispatch` | inject a store, read `store.x()`, call `store.update(...)` |
| `useParams` | `input()` bound from the route |
| `useNavigate` | `inject(Router).navigate([...])` |
| `{cond && <X/>}`, `.map()` | `@if`, `@for` (built-in control flow) |
| `dangerouslySetInnerHTML` | `[innerHTML]="html \| sanitizeHtml"` |

### Small improvements over the React version

* The 401 interceptor is registered once (React re-registered it on every navigation).
* Expired or invalid tokens are discarded on start-up.
* Profile updates roll back and show an error toast if the request fails.
* Changing an application status refreshes the list instead of reloading the page.
* Interview cards show the real scheduled time (React showed a hard-coded date).
* Company Jobs / Employees tabs show real data matching the company (React used static data).
* "Relevance" sort returns to the original order; Clear Filters also resets the range sliders.
* Image paths match the real file names exactly, so they also work on case-sensitive Linux hosts.
* Modals use the native `<dialog>` element (top layer, focus trap, Esc to close).
* Accessible labels on icon-only buttons; nav links are filtered by role.

---

## 11. Styling & theming

* **Tailwind CSS v4** is configured in CSS, not in a JS config file — see `src/styles.css`:
  * `@theme { … }` defines the `mine-shaft` and `bright-sun` colour scales, fonts, breakpoints and animations.
  * Breakpoints match React (`xsm 350`, `xs 476`, `sm 640`, `md 768`, `bs 900`, `lg 1024`, `xl 1280`, `2xl 1536`).
    The React app's `md-mx:` style classes are written as Tailwind's built-in **`max-md:`** variants.
* **Light/dark mode:** `mine-shaft-*` colours resolve to CSS variables (`--ms-50 … --ms-950`).
  `html.light-theme` swaps the ramp, so every component flips theme without extra code.
* **Component classes** in `@layer components` replace Mantine variants:
  `.btn` + `.btn-filled | .btn-light | .btn-outline | .btn-subtle | .btn-danger | .btn-success`,
  `.field`, `.field-label`, `.field-input`, `.field-error`, `.card`, `.chip`, `.tab`, `.dropdown` …
* **Icons:** `<app-icon name="search" [size]="20" />`. To add one, copy the inner SVG markup from
  [tabler.io/icons](https://tabler.io/icons) into `shared/ui/icon/icons.ts`.

---

## 12. Testing

```bash
npm test          # watch mode
npm run test:ci   # single run
```

Angular 21 uses **Vitest** with jsdom. Specs live next to the code (`*.spec.ts`):

| Spec | Covers |
|---|---|
| `core/utils/date.utils.spec.ts` | relative time, month-input round trip |
| `core/state/session.store.spec.ts` | JWT decoding, expired/malformed tokens, logout |
| `core/guards/auth.guards.spec.ts` | redirects for anonymous / wrong-role / guest-only |
| `features/find-jobs/job-filtering.spec.ts` | multi-select & salary filters, sorting |

---

## 13. Building & deploying

```bash
npm run build
```

The output is a static site in **`dist/job-portal-angular/browser/`** — host it on any static host
(Nginx, S3 + CloudFront, Netlify, Vercel, Firebase Hosting, AWS Amplify…).

Because this is a single-page app, the server must **fall back to `index.html`** for unknown
paths, otherwise refreshing `/find-jobs` returns 404:

* **Nginx**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
* **Netlify** — create `public/_redirects` with `/*  /index.html  200`
* **Vercel** — `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
* **S3 + CloudFront** — set the error document (403/404) to `/index.html` with response code 200.

Check `apiUrl` in `src/environments/environment.ts` before building. If the site is served over
**HTTPS**, the API must also be HTTPS, otherwise browsers block the requests as mixed content.

---

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `npm error Cannot read properties of null (reading 'edgesOut')` | Make sure `.npmrc` (with `legacy-peer-deps=true`) is present, or run `npm install --legacy-peer-deps`. |
| `The Angular CLI requires a minimum Node.js version…` | Upgrade Node to 20.19+, 22.12+ or 24+. |
| First API call takes a long time | The free Render backend is waking up — wait ~1 minute or run the backend locally. |
| Every request returns 401 / you get logged out | Token expired or the backend secret changed — log in again. |
| Network error / CORS error | Check `apiUrl` and that the backend is running; for HTTPS sites use an HTTPS API. |
| Page refresh gives 404 after deploy | Configure the `index.html` fallback (section 13). |
| Port 4200 is busy | `npm start -- --port 4300` |
| Styles missing after adding a new folder | Tailwind v4 scans the project automatically; restart `npm start` if a new file type isn't picked up. |

---

## 15. How to add a new page

1. Create `src/app/features/my-page/my-page.ts`:
   ```ts
   @Component({
     selector: 'app-my-page',
     changeDetection: ChangeDetectionStrategy.OnPush,
     template: `<div class="page p-4">Hello</div>`,
   })
   export class MyPage {}
   ```
2. Register it in `app.routes.ts` (lazy-loaded, optionally guarded):
   ```ts
   {
     path: 'my-page',
     canActivate: [authGuard],
     data: { roles: EMPLOYER_ROLES },
     loadComponent: () => import('./features/my-page/my-page').then((m) => m.MyPage),
   },
   ```
3. Need data? Add a method to the matching service in `core/services/api`, inject it, and keep
   the result in a `signal()`. Wrap the call with `.pipe(inject(LoadingStore).track())` to show
   the global loader.
4. Add a nav entry in `layout/header/nav-links.ts` if it belongs in the header.

Scaffold with the CLI if you prefer: `npx ng generate component features/my-page --flat`.
