# Jobify — Web App (React + TypeScript)

The web client for the **Jobify** job portal. A single-page React app that talks to the
**Spring Boot** backend over REST for authentication, jobs, applications, profiles and
notifications. It serves two roles — **Job Seekers** and **Employers** — from one app,
gated by role-based routes.

There is a companion native client in `../mobile_frontend` (React Native + Expo) that
shares the same backend.

---

## Tech stack

| Concern | Library |
|---|---|
| Framework | React 18 + TypeScript (Create React App) |
| UI | Mantine 7 (`@mantine/core`, `form`, `dates`, `notifications`, `carousel`, `tiptap`) |
| State | Redux Toolkit + React-Redux |
| Routing | React Router v6 |
| HTTP | axios (single instance with interceptors) |
| Auth | JWT (`jwt-decode`) stored in `localStorage` |
| Rich text | Tiptap (job descriptions) |
| Styling | Tailwind CSS + Mantine |

---

## Prerequisites

1. **Node.js 18+**
2. The **backend** running and reachable — see `../backend` (Spring Boot on port `8080`,
   MongoDB on `27017`).

---

## Setup & run

```bash
cd frontend
npm install
npm start        # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm test` (CRA test runner).

### Backend URL

The API base URL is configured in **`src/Interceptor/AxiosInterceptor.tsx`** (defaults to
`http://localhost:8080`). Update it there if your backend runs elsewhere. The axios
instance attaches `Authorization: Bearer <token>` from `localStorage` to every request and
logs the user out on a `401`.

---

## Project structure

```
src/
├── index.tsx / App.tsx        # app bootstrap + Mantine/Redux providers
├── Store.tsx                  # Redux store (user, profile, filter, sort, jwt, overlay)
├── Slices/                    # Redux slices
│   ├── JwtSlice.tsx           #   raw JWT string (auth gate)
│   ├── UserSlice.tsx          #   decoded user (id, name, accountType, profileId)
│   ├── ProfileSlice.tsx       #   applicant/employer profile (+ changeProfile → PUT)
│   ├── FilterSlice.tsx        #   Find Jobs / Find Talent filter criteria
│   ├── SortSlice.tsx          #   sort selection
│   └── OverlaySlice.tsx       #   global loading overlay
├── Interceptor/
│   └── AxiosInterceptor.tsx   # base URL + Bearer header + 401 handling
├── Services/                  # API layer (one concern per file)
│   ├── AuthService.tsx        #   POST /auth/login
│   ├── UserService.tsx        #   register, OTP send/verify, change password
│   ├── JobService.tsx         #   getAll/get/post/apply/postedBy/changeAppStatus
│   ├── ProfileService.tsx     #   get/getAll/update
│   ├── NotiService.tsx        #   notifications get/read
│   ├── NotificationService.tsx#   Mantine toast helpers
│   ├── FormValidation.tsx     #   email/password rules
│   ├── ProtectedRoute.tsx     #   auth + role-based route guard
│   └── PublicRoute.tsx        #   redirect away from auth pages when logged in
├── Pages/                     # route-level pages (AppRoutes.tsx defines all routes)
├── Components/                # feature components grouped by area
│   ├── SignUpLogin/           #   Login, SignUp, ResetPassword (OTP)
│   ├── FindJobs/ JobDesc/ ApplyJob/                  # applicant flows
│   ├── FindTalent/ TalentProfile/ PostJob/ PostedJob/# employer flows
│   ├── Profile/               #   about, skills, experience, certifications
│   ├── Header/ Footer/ LandingPage/                  # shell + marketing
│   └── JobHistory/ CompanyProfile/
└── Data/                      # static dropdown/option lists used by the filter & forms
```

---

## Features

### Job Seeker (APPLICANT)
- Sign up / login / **password reset via email OTP**.
- **Find Jobs** with client-side search, multi-filter and sort.
- **Job description** with rich-text content, related jobs, and one-click **Apply** (resume upload + cover letter).
- **Job History** — applied, saved, offered and in-progress applications.
- **Profile** — about, skills, experience and certifications (each edit persists via `PUT /profiles/update`).

### Employer (EMPLOYER)
- **Post a Job** (rich-text description, skills, draft/publish) and edit/close existing jobs.
- **Posted Jobs** grouped by status with applicant pipelines.
- Move applicants through **Applicants → Interviewing → Offered / Rejected** (schedule interview time).
- **Find Talent** and view candidate profiles.

Routes are guarded by role (`ProtectedRoute` with `allowedRoles`); unauthenticated users
are redirected to `/login`, and wrong-role access lands on `/unauthorized`.

---

## Auth model (shared with the backend)

- Login (`POST /auth/login`) returns `{ jwt }` only; the user object is the **decoded JWT**
  (`id`, `name`, `accountType`, `profileId`, with `email` from the `sub` claim) — there is
  no `/me` endpoint.
- Token + decoded user persist in `localStorage` (`token`, `user`, `accountType`) and the
  session rehydrates on load (in `Header.tsx`).
- Roles: `APPLICANT`, `EMPLOYER`, `ADMIN` (field `accountType`).
- Backend errors return HTTP 400/500 with `{ errorMessage }`; the UI surfaces that message.

---

## Backend endpoints used

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /users/register`, `POST /users/sendOtp/{email}`, `GET /users/verifyOtp/{email}/{otp}`, `POST /users/changePass` |
| Jobs | `GET /jobs/getAll`, `GET /jobs/get/{id}`, `POST /jobs/post`, `POST /jobs/apply/{id}`, `GET /jobs/postedBy/{id}`, `POST /jobs/changeAppStatus` |
| Profiles | `GET /profiles/get/{id}`, `GET /profiles/getAll`, `PUT /profiles/update` |
| Notifications | `GET /notification/get/{userId}`, `PUT /notification/read/{id}` |
