# Jobify — Mobile App (React Native + Expo)

The native mobile client for the **Jobify** job portal. It mirrors the behaviour of the
web `frontend` and talks to the same **Spring Boot** backend over REST, so jobs,
applications, profiles and notifications are all live data shared with the web app.

Dark theme with a bright-sun-yellow accent and Poppins type. Built with **Expo** so it
runs on Android, iOS, and web from one codebase.

---

## Tech stack

| Concern | Library |
|---|---|
| Framework | Expo SDK 51, React Native 0.74, React 18 |
| Navigation | `@react-navigation/native` (native-stack + bottom-tabs) |
| HTTP | `axios` (single instance with auth interceptor) |
| Auth/session | JWT (`jwt-decode`) persisted in `@react-native-async-storage/async-storage` |
| File upload | `expo-document-picker` (resume) + `expo-file-system` (→ base64) |
| Images | `expo-image-picker` (profile photo → base64) |
| Fonts / icons | `@expo-google-fonts/poppins`, `@expo/vector-icons` |

---

## Prerequisites

1. **Node.js 18+**
2. The **backend** running and reachable — see `../backend` (Spring Boot on port `8080`,
   MongoDB on `27017`).
3. **Expo Go** on a physical device, or an Android/iOS emulator.

---

## Configuration — point the app at your backend

The API base URL is read from `EXPO_PUBLIC_API_URL` (see `src/config.js`), with a
platform fallback. Set it in `mobile_frontend/.env`:

```bash
# Physical phone (Expo Go): use your PC's LAN IP (ipconfig → IPv4). Phone + PC on same Wi-Fi.
EXPO_PUBLIC_API_URL=http://192.168.0.55:8080
```

- **Android emulator**: leave it unset — the fallback `http://10.0.2.2:8080` maps to the host's `localhost`.
- **iOS simulator**: the fallback `http://localhost:8080` works.
- There is **no `/api` context path** — routes are root-relative (e.g. `POST /auth/login`).
- Restart Expo with cache cleared after changing `.env`: `npx expo start -c`.

---

## Run

```bash
cd mobile_frontend
npm install            # install dependencies
npm start              # start the Metro bundler  (or: npx expo start -c)
```

Then:
- Press **a** for the Android emulator (or scan the QR with **Expo Go**)
- Press **i** for the iOS simulator (macOS only)
- Press **w** for web

---

## How it works (architecture)

```
src/
├── config.js                 # API base URL (EXPO_PUBLIC_API_URL + platform fallback)
├── api/client.js             # axios instance: Bearer-token interceptor, 401/403 → logout, errMessage()
├── services/                 # one module per backend resource
│   ├── authService.js        # /auth/login, /users/register, OTP reset (sendOtp/verifyOtp/changePass)
│   ├── jobService.js         # /jobs/getAll|get|post|apply|postedBy|changeAppStatus
│   ├── profileService.js     # /profiles/get|getAll|update
│   └── notificationService.js# /notification/get|read
├── context/AppContext.js     # AUTH + session: login/register/logout, token+user in AsyncStorage,
│                             #   restore on launch, profile load, savedJobs + toggleSave (PUT profile)
├── utils/
│   ├── format.js             # timeAgo, pkgText, stripHtml, fileToBase64, initials
│   └── validation.js         # email/password rules (match the web + backend)
├── navigation/
│   ├── RootNavigator.js      # gates on auth; renders ApplicantTabs vs EmployerTabs by accountType
│   └── Tabs.js               # bottom-tab sets for each role
├── components/               # JobCard, Tag, Field, PrimaryButton, ScreenHeader, ResetPasswordModal
├── theme.js                  # colors, fonts, radii (design tokens)
└── screens/                  # all screens (see below)
```

**Auth flow.** `POST /auth/login` returns only `{ jwt }`. The user object is the decoded
JWT (`id`, `name`, `accountType`, `profileId`, `sub`=email) — there is no `/me` endpoint.
The token is stored in AsyncStorage and sent as `Authorization: Bearer <jwt>` on every
request. On launch the session is restored; a `401/403` clears it and returns to Login.
The role (`APPLICANT` / `EMPLOYER`) decides which tab set is shown.

---

## Features

### Job Seeker (APPLICANT)
- **Login / Sign up / Reset password** — real auth; OTP reset via email (`sendOtp` → `verifyOtp` → `changePass`).
- **Home** — greeting from your profile, categories, latest active jobs (pull-to-refresh).
- **Find Jobs** — live job list with working search, filter chips, and sort.
- **Job Detail** — full job data, required skills, description; **save** and **Apply** (shows "Applied" once you have).
- **Apply** — name/email prefilled, phone + cover letter, **resume upload** (PDF/DOC → base64) → `POST /jobs/apply/{id}`.
- **My Jobs** — *Applied* (with live application status) and *Saved* tabs.
- **Profile / Edit Profile** — photo, info, about, skills, experience, certifications → `PUT /profiles/update`.
- **Company** — open positions at a company, derived live from jobs.
- **Notifications** — fetched from the backend; tapping marks read and deep-links.

### Employer (EMPLOYER)
- **Find Talent** — live candidate profiles with search.
- **Candidate Detail** — about, skills, experience, certifications.
- **Post a Job** — full form; publish (`ACTIVE`) or save as draft (`DRAFT`); also used to edit.
- **Posted Jobs** — your jobs grouped by **Active / Draft / Closed**.
- **Posted Detail** — applicants grouped by stage with actions: **Interview / Offer / Reject** (`changeAppStatus`) and **Close** the job.

---

## Backend endpoints used

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /users/register`, `POST /users/sendOtp/{email}`, `GET /users/verifyOtp/{email}/{otp}`, `POST /users/changePass` |
| Jobs | `GET /jobs/getAll`, `GET /jobs/get/{id}`, `POST /jobs/post`, `POST /jobs/apply/{id}`, `GET /jobs/postedBy/{id}`, `POST /jobs/changeAppStatus` |
| Profiles | `GET /profiles/get/{id}`, `GET /profiles/getAll`, `PUT /profiles/update` |
| Notifications | `GET /notification/get/{userId}`, `PUT /notification/read/{id}` |

Enums: `accountType` = `APPLICANT \| EMPLOYER \| ADMIN`; `jobStatus` = `ACTIVE \| DRAFT \| CLOSED`;
`applicationStatus` = `APPLIED \| INTERVIEWING \| OFFERED \| REJECTED`. Binary fields
(`resume`, profile `picture`) are exchanged as base64 strings.

---

## Notes & limitations

- The backend has **no company resource**, so the Company screen derives its stats and
  open roles from live jobs rather than a dedicated company API.
- Errors from the backend come back as HTTP 400/500 with `{ errorMessage }`; the app
  surfaces that message (it does not rely on status codes).
- `src/data/jobs.js` still provides the static **category chips** on Home (UI-only list,
  same as the web). The other `src/data/*` sample files are no longer used.
