# Web Frontend — Deep Dive (React + TypeScript)

The browser client for **Jobify**. A single-page React app (Create React App + TypeScript)
that consumes the Spring Boot REST API. This document explains the web app in detail; for the
whole-system overview see `../project-explain.md`.

---

## 1. Tech stack & libraries (what each is for)

| Library | Role in this app |
|---|---|
| **react / react-dom** 18 | UI framework |
| **typescript** | Static typing across the app |
| **react-scripts** (CRA) | Build/dev tooling (`start`, `build`, `test`) |
| **@reduxjs/toolkit** + **react-redux** | Global state (auth, profile, filters, sort, overlay) |
| **react-router-dom** v6 | Client-side routing + route guards |
| **axios** | HTTP client (one instance + interceptors) |
| **jwt-decode** | Decode the JWT to get the logged-in user & role |
| **@mantine/core** + hooks | UI component library (inputs, modals, cards, layout) |
| **@mantine/form** | Form state & validation |
| **@mantine/dates** | Date pickers (experience, interview time) |
| **@mantine/notifications** | Toast notifications (success/error) |
| **@mantine/carousel** + **embla-carousel-react** | Carousels (landing/companies) |
| **@mantine/tiptap** + **@tiptap/** | Rich-text editor for job descriptions |
| **@tabler/icons-react** | Icon set |
| **tailwindcss** | Utility CSS alongside Mantine |
| **dompurify** | Sanitize rich-text HTML before rendering |
| **dayjs** | Date formatting |
| **aos** / **react-fast-marquee** | Landing-page animations |

Scripts: `npm start` (dev @ :3000), `npm run build`, `npm test`.

---

## 2. Folder structure (`src/`)

```
src/
├── index.tsx, App.tsx          # bootstrap + Mantine/Redux providers
├── Store.tsx                   # configureStore — combines all slices
├── Slices/                     # Redux Toolkit slices
├── Interceptor/AxiosInterceptor.tsx   # axios instance + interceptors
├── Services/                   # API layer (one file per concern)
├── Pages/                      # route-level pages + AppRoutes.tsx
├── Components/                 # feature components grouped by area
└── Data/                       # static dropdown/option lists for filters & forms
```

---

## 3. State management (Redux Toolkit) — `src/Slices/`

| Slice | Holds | Notes |
|---|---|---|
| **JwtSlice** | raw JWT string | The auth gate; persisted in `localStorage` under `token` |
| **UserSlice** | decoded user `{id, name, accountType, profileId}` | `setUser` also writes `accountType` to localStorage |
| **ProfileSlice** | logged-in profile | `changeProfile` = **optimistic update + `PUT /profiles/update`** (how all profile edits persist) |
| **FilterSlice** | Find Jobs / Find Talent criteria | Filtering is done **client-side** |
| **SortSlice** | current sort option | Sorting is **client-side** |
| **OverlaySlice** | boolean | Global loading overlay |

`Store.tsx` combines these reducers; components read with `useSelector` and dispatch actions.

---

## 4. Networking — `src/Interceptor/AxiosInterceptor.tsx` + `src/Services/`

- **One axios instance** with a base URL (`http://localhost:8080`):
  - *request* interceptor → attaches `Authorization: Bearer <token>` from localStorage.
  - *response* interceptor → on `401`, clears auth and redirects to `/login`.
- **Services layer** — components never call axios directly; they call a service:
  - `AuthService` → `POST /auth/login`
  - `UserService` → register, OTP send/verify, change password
  - `JobService` → getAll / get / post / apply / postedBy / changeAppStatus
  - `ProfileService` → get / getAll / update
  - `NotiService` → notifications get / read
  - `NotificationService` → Mantine toast helpers
  - `FormValidation` → email/password rules
  - `ProtectedRoute` / `PublicRoute` → route guards

---

## 5. Routing & role gating — `src/Pages/AppRoutes.tsx`

- **`ProtectedRoute`** checks the JWT and an `allowedRoles` list; unauthenticated → `/login`,
  wrong role → `/unauthorized`.
- **`PublicRoute`** keeps logged-in users away from `/login` & `/signup`.
- Applicant-only routes (find-jobs, job desc, apply, job-history), employer-only routes
  (find-talent, post-job, posted-jobs), and shared routes (profile) are separated by role.

---

## 6. Signature flows (what to demo)

- **Login** → `AuthService` → store JWT → `jwtDecode(jwt)` → `setUser` (role from `accountType`)
  → redirect. Session rehydrates on load inside `Header.tsx`.
- **Find Jobs** → `getAllJobs()` once → filter/sort **in memory** from the `filter`/`sort` slices.
- **Apply** → read resume file → base64 (strip the `data:` prefix) → `POST /jobs/apply/{id}`.
- **Profile edit** (about/skills/experience/certifications/picture) → build full profile →
  `changeProfile` → optimistic UI + `PUT /profiles/update`.
- **Employer pipeline** → `changeAppStatus` moves an applicant
  `APPLIED → INTERVIEWING → OFFERED/REJECTED` (with interview time).
- **Job description** HTML is sanitized with **DOMPurify** before rendering.

---

## 7. Auth model (shared with backend & mobile)

- Login returns **only `{ jwt }`**; identity & role come from **decoding the JWT** — there is
  no `/me` endpoint.
- Persisted in `localStorage`: `token` (raw), `user` (JSON), `accountType` (raw).
- Roles: `APPLICANT`, `EMPLOYER`, `ADMIN`.
- Backend errors arrive as HTTP 400/500 with `{ errorMessage }`; the UI shows that message.

---

## 8. Run it

```bash
cd frontend
npm install
npm start        # http://localhost:3000  (backend must be on :8080)
```

Update the API base URL in `src/Interceptor/AxiosInterceptor.tsx` if the backend runs elsewhere.

---

## 9. Likely questions about the web app

1. **Why Redux Toolkit?** Central auth/profile/filter state shared across many routes; slices
   keep it organized; `localStorage` integration in the slices handles persistence.
2. **How is the route protection done?** `ProtectedRoute` reads the JWT + role and redirects;
   guards wrap the route elements in `AppRoutes`.
3. **How do all profile edits save with one endpoint?** Each editor builds the *full* profile
   object and dispatches `changeProfile`, which optimistically updates state and calls
   `PUT /profiles/update`.
4. **Why client-side filtering?** Simplicity — the backend returns all jobs and the UI filters
   in memory. Improvement: server-side search + pagination for scale.
5. **How is XSS handled for rich text?** Job descriptions are HTML; DOMPurify sanitizes before
   `dangerouslySetInnerHTML`.
