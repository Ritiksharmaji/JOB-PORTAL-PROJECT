# Jobify — Full-Stack Job Portal · Interview Explainer

A single guide to explain this project end-to-end in an interview. It covers the
**backend (Spring Boot)**, the **web frontend (React)**, and the **mobile app
(React Native / Expo)** — all sharing one backend and one auth model.

---

## 1. Elevator pitch (30 seconds)

> "Jobify is a full-stack job portal with two roles — **job seekers** and **employers**.
> Job seekers search and filter jobs, apply with a resume, track application status, and
> manage a rich profile (experience, skills, certifications). Employers post jobs, review
> applicants, and move them through a hiring pipeline (interview → offer → reject).
> It's a **Spring Boot + MongoDB** REST backend with **JWT auth**, a **React + Redux**
> web client, and a **React Native (Expo)** mobile client that reuses the same API. I
> also built the mobile client from a static prototype into a fully API-driven app."

---

## 2. Architecture at a glance

```
                ┌─────────────────────┐        ┌─────────────────────┐
                │   Web frontend      │        │   Mobile app        │
                │  React + TS + Redux │        │  React Native/Expo  │
                │  Mantine UI         │        │  React Navigation   │
                └─────────┬───────────┘        └─────────┬───────────┘
                          │  HTTPS/REST  (Authorization: Bearer <JWT>)
                          └───────────────┬───────────────┘
                                          ▼
                            ┌──────────────────────────┐
                            │   Spring Boot Backend     │
                            │  Controllers → Services   │
                            │  → Repositories           │
                            │  Spring Security + JWT     │
                            └─────────────┬─────────────┘
                                          ▼
                            ┌──────────────────────────┐
                            │        MongoDB            │
                            │ users · jobs · profiles · │
                            │ notification · otp        │
                            └──────────────────────────┘
```

**Key idea:** stateless JWT auth. The backend issues a JWT on login; both clients store it
and send it on every request. There is **no `/me` endpoint** — the user's identity and role
come from **decoding the JWT** on the client.

---

## 3. Tech stack (what to name-drop)

| Tier | Stack |
|---|---|
| **Backend** | Java, Spring Boot, Spring Security, JWT (jjwt/HS512), Spring Data MongoDB, Spring Mail (OTP), Bean Validation, Maven |
| **Web** | React 18 + TypeScript, Redux Toolkit, React Router v6, Mantine UI, axios, jwt-decode, Tiptap (rich text), Tailwind |
| **Mobile** | React Native 0.74 + Expo SDK 51, React Navigation, axios, jwt-decode, AsyncStorage, expo-document-picker / image-picker / file-system |

---

## 4. Backend deep dive (Spring Boot)

### 4.1 Layered architecture
- **Controller (`@RestController`)** — HTTP endpoints, request validation, maps to DTOs.
- **Service** — business logic (apply once, change status, send OTP, etc.).
- **Repository (Spring Data Mongo)** — persistence.
- **DTO ↔ Entity** — DTOs cross the wire; entities persist (e.g. `resume`/`picture` are
  base64 `String` in DTOs but `byte[]` in entities).

### 4.2 Security & JWT flow (most-asked topic)
1. `POST /auth/login` with email + password → `AuthenticationManager` verifies credentials.
2. On success a **JWT** is signed (HS512) with claims: `sub` (email), `id`, `name`,
   `accountType`, `profileId`. Expiry ≈ **10 hours**. Response: `{ "jwt": "..." }`.
3. Clients send `Authorization: Bearer <jwt>` on every protected call.
4. A **`JwtAuthenticationFilter`** runs before Spring's auth filter, validates the token,
   and sets the security context. Sessions are **stateless** (`SessionCreationPolicy.STATELESS`),
   CSRF disabled.
5. **Public endpoints**: `/auth/login`, `/users/register`, `/users/sendOtp/**`,
   `/users/verifyOtp/**`, `/users/changePass`. Everything else requires a valid token.

> Talking point: roles exist as data (`accountType`) but the backend authorizes
> all-or-nothing (any authenticated user). **Role-based access is enforced on the clients**
> (route guards). A good "what would you improve" answer: move role checks server-side with
> `@PreAuthorize`.

### 4.3 Core domain (entities / enums)
- **User**: `id, name, email (unique), password (bcrypt), accountType, profileId`.
- **Profile**: `id, name, email, jobTitle, company, location, about, picture, totalExp,
  skills[], experiences[], certifications[], savedJobs[]`. A profile is **auto-created on
  registration** and linked via `user.profileId`.
- **Job**: `id, jobTitle, company, applicants[], about, experience, jobType, location,
  packageOffered, postTime, description, skillsRequired[], jobStatus, postedBy`.
- **Applicant (embedded in Job)**: `applicantId, name, email, phone, website, resume(base64),
  coverLetter, timestamp, applicationStatus, interviewTime`.
- **Notification**: `id, userId, message, action, route, status, timestamp`.
- **Enums**: `AccountType {APPLICANT, EMPLOYER, ADMIN}`, `JobStatus {ACTIVE, DRAFT, CLOSED}`,
  `ApplicationStatus {APPLIED, INTERVIEWING, OFFERED, REJECTED}`, `NotificationStatus {READ, UNREAD}`.

### 4.4 Notable design decisions (great interview material)
- **Custom numeric IDs** via a sequence collection (`Utilities.getNextSequenceId`) instead
  of Mongo ObjectIds — friendlier URLs/keys.
- **OTP password reset**: `sendOtp` emails a 6-digit code (Spring Mail), stored with a
  timestamp; a **scheduled job** purges OTPs after 5 minutes; `verifyOtp` validates;
  `changePass` updates the bcrypt hash.
- **Embedded applicants**: applications live inside the Job document (no separate join) —
  simple reads for "applicants of a job", at the cost of document growth.
- **Centralized error handling** (`@ControllerAdvice`): business errors → `JobPortalException`
  → HTTP 500 with `{ errorMessage, errorCode, timeStamp }`; validation errors → HTTP 400.
  Messages are externalized in `application.properties`.
- **CORS** enabled per controller (`@CrossOrigin`) for the browser client.

### 4.5 Endpoint map (resource → purpose)
| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/login` |
| Users | `POST /users/register`, `POST /users/login`, `POST /users/changePass`, `POST /users/sendOtp/{email}`, `GET /users/verifyOtp/{email}/{otp}` |
| Jobs | `POST /jobs/post`, `POST /jobs/postAll`, `GET /jobs/getAll`, `GET /jobs/get/{id}`, `POST /jobs/apply/{id}`, `GET /jobs/postedBy/{id}`, `GET /jobs/history/{id}/{status}`, `POST /jobs/changeAppStatus` |
| Profiles | `GET /profiles/get/{id}`, `GET /profiles/getAll`, `PUT /profiles/update` |
| Notifications | `GET /notification/get/{userId}`, `PUT /notification/read/{id}` |

---

## 5. Web frontend deep dive (React)

### 5.1 State management (Redux Toolkit)
Slices in `src/Slices/`:
- **JwtSlice** — the raw token (the auth gate).
- **UserSlice** — the decoded user (`id, name, accountType, profileId`); also writes `accountType` to localStorage.
- **ProfileSlice** — the logged-in profile; `changeProfile` does an **optimistic update + `PUT /profiles/update`** (this is how *all* profile edits persist).
- **FilterSlice / SortSlice** — client-side Find Jobs / Find Talent criteria.
- **OverlaySlice** — global loading overlay.

### 5.2 Networking
- One **axios instance** (`AxiosInterceptor.tsx`): request interceptor attaches
  `Bearer <token>`; response interceptor logs out on `401`.
- **Services layer** (`src/Services/*`) — one module per resource; components never call
  axios directly.

### 5.3 Routing & roles
- `ProtectedRoute` checks the JWT and `allowedRoles`; `PublicRoute` keeps logged-in users
  off `/login` & `/signup`. Applicant-only, employer-only, and shared routes are separated.

### 5.4 Signature flows
- **Login** → `/auth/login` → store JWT → `jwtDecode` → set user (role from `accountType`).
- **Apply** → resume file → base64 (strip `data:` prefix) → `POST /jobs/apply/{id}`.
- **Filtering/sorting/job-history** are computed **client-side** from `getAllJobs` (no
  server-side query params) — a deliberate simplicity trade-off worth mentioning.

---

## 6. Mobile app deep dive (React Native + Expo)

> Strong story: *"I took a static UI prototype with zero networking and converted it into a
> fully API-driven app that mirrors the web client against the same backend."*

### 6.1 What was added
- **API client** (`src/api/client.js`) — axios instance, `Bearer` interceptor, `401/403` → logout.
- **Services** (`src/services/*`) — Auth, Job, Profile, Notification — same contract as web.
- **AuthContext** (`src/context/AppContext.js`) — `login/register/logout`, JWT decode,
  token+user persisted in **AsyncStorage**, **session restore on launch**, profile load,
  `savedJobs` + `toggleSave` (persisted via `PUT /profiles/update`).
- **Navigation gating** — `RootNavigator` shows the auth stack when logged out, and the
  **Applicant vs Employer tab set based on `accountType`** when logged in.
- **Native concerns** — resume upload via `expo-document-picker` + `expo-file-system`
  (→ base64); profile photo via `expo-image-picker`; loading/error/empty states.

### 6.2 Web ↔ Mobile parity & differences
- **Same** auth model, endpoints, enums, and the "decode JWT for identity" approach.
- **Storage**: localStorage (web) → AsyncStorage (mobile).
- **Base URL**: configurable via `EXPO_PUBLIC_API_URL`; on a device it must be the PC's
  **LAN IP** (not `localhost`) — a classic mobile-networking gotcha to mention.
- **Company screen** derives data from jobs (backend has no company resource).

---

## 7. Cross-cutting concepts (quick answers)

- **Auth**: stateless JWT, `Authorization: Bearer`, identity from decoded claims, ~10h expiry.
- **Why no `/me`?** The JWT already carries `id/name/accountType/profileId`, so the client
  decodes instead of making a round-trip. (Trade-off: claims can go stale until re-login.)
- **Binary data**: resume & profile picture travel as **base64 strings** in DTOs.
- **Dates**: ISO `LocalDateTime`.
- **Errors**: surface the backend's `errorMessage` rather than relying on HTTP status codes.

---

## 8. Likely interview questions (and how to answer)

1. **Walk me through login.** → §4.2 + §5.4 (credentials → signed JWT → store → decode → role).
2. **How is auth secured?** → stateless, JWT filter before the auth filter, public allow-list, bcrypt passwords.
3. **How do employers manage applicants?** → applicants embedded in the Job; `changeAppStatus`
   transitions `APPLIED → INTERVIEWING/OFFERED/REJECTED` (+ interview time).
4. **How does the resume upload work?** → file → base64 → DTO field → stored as `byte[]`.
5. **Web vs mobile differences?** → §6.2 (storage, base URL, same API).
6. **What would you improve?** → server-side role authorization (`@PreAuthorize`), pagination &
   server-side job search, refresh tokens, move base64 blobs to object storage, HTTPS everywhere,
   externalize secrets (currently in properties).
7. **Why MongoDB?** → flexible document model fits nested applicants/experiences; fast reads for
   job+applicants in one document.
8. **Biggest challenge?** → converting the static mobile app: rebuilding auth/session, navigation
   gating by role, and native file uploads while keeping behaviour identical to the web client.

---

## 9. How to run the whole thing

```bash
# 1) Backend  (needs Java + MongoDB running on :27017)
cd backend && ./mvnw spring-boot:run          # serves http://localhost:8080

# 2) Web frontend
cd frontend && npm install && npm start        # http://localhost:3000

# 3) Mobile app
cd mobile_frontend && npm install
#   set EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:8080 in .env  (physical device)
npx expo start -c                              # scan QR with Expo Go
```

See each folder's `README.md` for tier-specific detail, and
`backend/Jobify.postman_collection.json` to exercise the API.
