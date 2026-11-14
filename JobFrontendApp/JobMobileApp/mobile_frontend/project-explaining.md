# Mobile App — Deep Dive (React Native + Expo)

The native client for **Jobify**, built with Expo. It mirrors the web frontend's behaviour
against the same Spring Boot backend. This document explains the mobile app in detail; for the
whole-system overview see `../project-explain.md`.

> **Headline story for interviews:** this app started as a *static UI prototype* with zero
> networking, persistence, or auth. I converted it into a **fully API-driven app** — adding an
> HTTP layer, JWT auth + session persistence, role-based navigation, and native file uploads —
> while keeping behaviour consistent with the web client.

---

## 1. Tech stack & libraries (what each is for)

| Library | Role in this app |
|---|---|
| **expo** SDK 51 | Tooling/runtime — run on Android, iOS, web from one codebase |
| **react-native** 0.74 / **react** 18 | UI framework |
| **@react-navigation/native** | Navigation container |
| **@react-navigation/native-stack** | Stack navigator (auth + detail screens) |
| **@react-navigation/bottom-tabs** | Tab bars (separate sets per role) |
| **axios** | HTTP client (one instance + auth interceptor) |
| **jwt-decode** | Decode the JWT → logged-in user & role |
| **@react-native-async-storage/async-storage** | Persist token + user (session survives restarts) |
| **expo-document-picker** | Pick the resume file (PDF/DOC) |
| **expo-file-system** | Read the picked file → base64 for upload |
| **expo-image-picker** | Pick a profile photo → base64 |
| **@expo-google-fonts/poppins** | Poppins font family |
| **@expo/vector-icons** | Ionicons throughout the UI |

Scripts: `npm start` / `npx expo start -c`, `expo start --android/--ios/--web`.

---

## 2. Folder structure (`src/`)

```
src/
├── config.js                 # API base URL (EXPO_PUBLIC_API_URL + platform fallback)
├── api/client.js             # axios instance: Bearer interceptor, 401/403 → logout, errMessage()
├── services/                 # one module per backend resource (mirrors the web Services/)
│   ├── authService.js        #   /auth/login, /users/register, OTP reset
│   ├── jobService.js         #   /jobs getAll|get|post|apply|postedBy|changeAppStatus
│   ├── profileService.js     #   /profiles get|getAll|update
│   └── notificationService.js#   /notification get|read
├── context/AppContext.js     # AUTH + app state (the heart of the app — see §4)
├── utils/
│   ├── format.js             # timeAgo, pkgText, stripHtml, fileToBase64, initials
│   └── validation.js         # email/password rules (match web + backend)
├── navigation/
│   ├── RootNavigator.js      # gates on auth; picks ApplicantTabs vs EmployerTabs by role
│   └── Tabs.js               # bottom-tab sets for each role
├── components/               # JobCard, Tag, Field, PrimaryButton, ScreenHeader, ResetPasswordModal
├── theme.js                  # colors, fonts, radii (design tokens)
└── screens/                  # all screens (auth, applicant, employer, shared)
```

---

## 3. Networking — `src/config.js`, `src/api/client.js`, `src/services/`

- **Base URL** comes from `EXPO_PUBLIC_API_URL` (in `.env`) with a platform fallback
  (`10.0.2.2:8080` Android emulator / `localhost:8080` iOS). On a **physical device** it must be
  the PC's **LAN IP** (e.g. `http://192.168.x.x:8080`) — a classic mobile gotcha.
- **`api/client.js`** = one axios instance:
  - *request* interceptor attaches `Authorization: Bearer <token>`.
  - *response* interceptor: on `401/403` it triggers logout.
  - `errMessage(err)` extracts the backend's `errorMessage` for clean toasts.
- **Services** map 1:1 to the web `Services/` so both clients use the same contract.

---

## 4. Auth & session — `src/context/AppContext.js`

This Context replaced the old in-memory demo state. It provides:

- `user`, `token`, `role` (derived from `user.accountType`), `loading`.
- `login(email, password)` → `POST /auth/login` → `jwtDecode(jwt)` → persist + set state.
- `register(payload)` → `POST /users/register`.
- `logout()` → clear AsyncStorage + state.
- `profile`, `refreshProfile()`, `updateProfile(updated)` → optimistic update + `PUT /profiles/update`.
- `savedJobs` + `toggleSave(id)` → persisted inside the profile (`PUT /profiles/update`), mirroring web.

**Session persistence:** token + user are stored in **AsyncStorage**; on launch the provider
restores them and re-attaches the auth header, so you stay logged in across restarts. A `401`
from any call clears the session.

---

## 5. Navigation & role gating — `src/navigation/`

- **`RootNavigator`** reads auth state:
  - **logged out** → auth stack (Login, Signup).
  - **logged in** → the role's tab set + the detail/stack screens (JobDetail, Apply, Company,
    TalentDetail, PostedDetail, Edit Profile, etc.).
- **`Tabs.js`** defines two bottom-tab sets:
  - **Applicant**: Home · Find Jobs · My Jobs · Profile.
  - **Employer**: Find Talent · Post Job · Listings · Profile.
- Which set shows is decided by **`accountType`** from the JWT (not a manual toggle).

---

## 6. Screens & what they call

| Screen | Backend calls |
|---|---|
| Login / Signup / ResetPassword | `/auth/login`, `/users/register`, OTP `sendOtp`/`verifyOtp`/`changePass` |
| Home / Find Jobs | `GET /jobs/getAll` (client-side search/filter/sort, ACTIVE only) |
| Job Detail | `GET /jobs/get/{id}` (+ applied detection, save toggle) |
| Apply | document picker → base64 → `POST /jobs/apply/{id}` |
| My Jobs | applied from `getAll`; saved from `profile.savedJobs` |
| Profile / Edit | `GET /profiles/get/{id}` · `PUT /profiles/update` (info/about/skills/experience/certs/photo) |
| Company | open positions derived from `getAll` (no company API) |
| Find Talent / Talent Detail | `GET /profiles/getAll` · `GET /profiles/get/{id}` |
| Post Job | `POST /jobs/post` (ACTIVE or DRAFT) |
| Posted Jobs / Detail | `GET /jobs/postedBy/{id}` · `POST /jobs/changeAppStatus` |
| Notifications | `GET /notification/get/{userId}` · `PUT /notification/read/{id}` |

---

## 7. Native concerns handled

- **Resume upload**: `expo-document-picker` → `expo-file-system.readAsStringAsync(uri, base64)`
  → send as a base64 string (matches the backend's `byte[]`/base64 contract).
- **Profile photo**: `expo-image-picker` with `base64: true`.
- **Persistence**: AsyncStorage (the mobile equivalent of the web's `localStorage`).
- **Loading / error / empty** states added to every async screen (the static version had none).

---

## 8. Web ↔ Mobile parity & differences

| Aspect | Web | Mobile |
|---|---|---|
| Auth | JWT, decode for identity | **Same** |
| Endpoints / enums | shared | **Same** |
| Token storage | `localStorage` | **AsyncStorage** |
| Base URL | `localhost:8080` | configurable; LAN IP on device |
| State | Redux Toolkit | React Context (`AppContext`) |
| Company data | (web has a page) | derived from jobs (no company API) |

---

## 9. Configure & run

```bash
cd mobile_frontend
npm install
# .env (physical device): EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:8080
npx expo start -c        # scan QR with Expo Go, or press a / i / w
```

If you change `.env`, restart with `-c` (clears the cache so the new value is picked up).
Backend must be running on `:8080` and reachable from the phone (same Wi-Fi; allow port 8080
through the PC firewall).

---

## 10. Likely questions about the mobile app

1. **Biggest challenge?** Converting a static prototype: rebuilding auth/session, role-based
   navigation, and native file upload while matching the web behaviour.
2. **How does login persist?** Token+user in AsyncStorage; restored on launch; `401` clears it.
3. **How do you know the user's role?** Decoded from the JWT (`accountType`) — drives which tab
   set renders.
4. **Why couldn't the phone reach the backend at first?** `localhost`/`10.0.2.2` point at the
   phone/emulator, not the PC — fixed by pointing `EXPO_PUBLIC_API_URL` at the PC's LAN IP.
5. **How is the resume uploaded?** Picked with expo-document-picker, read as base64 via
   expo-file-system, sent in the application DTO.
6. **Code reuse with web?** Same service contract and auth model; only storage and UI layer differ.
