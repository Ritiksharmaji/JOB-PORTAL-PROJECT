# JobHook — Express.js Backend

The **Express.js** version of the JobHook job-portal API — a drop-in replacement for the
Spring Boot backend in [`../backend_springBoot`](../backend_springBoot).

* **Same endpoints, same request/response JSON, same error format** → the React, Angular and
  Next.js frontends work with either backend without code changes.
* **Same MongoDB collections and document shapes** → both backends can run against the **same
  database** at the same time.
* **Same JWTs and password hashes** → a token issued by one backend is accepted by the other, and
  users registered on one can log in on the other (verified against the real Spring server).

> Node.js 20.19+ · Express 5 · TypeScript (ESM) · Mongoose 9 · Zod 4 · JWT (HS512) · bcrypt ·
> Nodemailer · helmet · rate limiting · pino logging · Vitest + Supertest

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Prerequisites](#2-prerequisites)
3. [Scripts](#3-scripts)
4. [Configuration (.env)](#4-configuration-env)
5. [Dependencies — what each one is for](#5-dependencies--what-each-one-is-for)
6. [Project structure](#6-project-structure)
7. [Architecture & request flow](#7-architecture--request-flow)
8. [API reference](#8-api-reference)
9. [Compatibility with the Spring Boot backend](#9-compatibility-with-the-spring-boot-backend)
10. [Security improvements over the Spring version](#10-security-improvements-over-the-spring-version)
11. [Spring Boot → Express mapping](#11-spring-boot--express-mapping)
12. [Testing](#12-testing)
13. [Deployment](#13-deployment)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Quick start

```bash
cd backend_ExpressJs
npm install
cp .env.example .env        # Windows: copy .env.example .env   (then edit it)
npm run dev
```

The API listens on **http://localhost:8080** — the same port as Spring Boot, so the frontends'
"local backend" setting works unchanged. Check it with:

```bash
curl http://localhost:8080/health      # {"status":"UP","database":"UP"}
```

To point a frontend at it, set its API URL to `http://localhost:8080`:

| Frontend | Where |
|---|---|
| React | `frontend_ReactJs/src/Interceptor/AxiosInterceptor.tsx` → `baseURL` |
| Angular | `frontend_Angular/src/environments/environment.development.ts` → `apiUrl` |
| Next.js | `frontend_NextJs/.env.local` → `NEXT_PUBLIC_API_URL` |

Running Spring Boot at the same time? Give Express another port: `PORT=8081` in `.env`.

---

## 2. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | **20.19+** (22 LTS recommended) | `node -v` |
| npm | 10+ | ships with Node |
| MongoDB | 6+ (local, Docker or Atlas) | the same database the Spring backend uses |

No local MongoDB? Start one with Docker:

```bash
docker run -d --name jobhook-mongo -p 27017:27017 mongo:7
```

---

## 3. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API with auto-reload (`tsx watch`), pretty logs |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled server (`node dist/server.js`) — use in production |
| `npm test` | Runs the integration tests once (needs MongoDB — see [Testing](#12-testing)) |
| `npm run test:watch` | Tests in watch mode |
| `npm run typecheck` | Type-checks without emitting files |
| `npm run lint` | ESLint (typescript-eslint) |
| `npm run format` | Prettier |

---

## 4. Configuration (.env)

The variable names match the Spring backend, so **the Spring `.env` can be reused as-is**
(`SPRING_DATA_MONGODB_URI` is accepted as an alias of `MONGODB_URI`).

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP port (hosting platforms set it automatically) |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/jobportal` | MongoDB connection string (alias: `SPRING_DATA_MONGODB_URI`) |
| `JWT_SECRET` | dev-only fallback (same as Spring's) | **Required in production.** Signs the HS512 tokens |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | empty | Gmail address + **App Password** for OTP emails |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` | SMTP server |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins, or `*` (like Spring's `@CrossOrigin`) |
| `LOG_LEVEL` | `info` | pino log level |

* `.env` is loaded with Node's built-in `process.loadEnvFile` (no `dotenv` dependency) and is
  validated with Zod on startup — a missing/invalid value stops the server with a clear message.
* In development, if mail is not configured the **OTP is printed in the server log** instead of
  being emailed, so the forgot-password flow can still be tested.
* `.env` is git-ignored; only `.env.example` is committed.

---

## 5. Dependencies — what each one is for

### Runtime

| Package | Purpose | Spring Boot equivalent |
|---|---|---|
| `express` (v5) | HTTP server & routing; async errors are forwarded to the error handler automatically | `spring-boot-starter-web` |
| `mongoose` | MongoDB ODM: schemas, models, queries | `spring-boot-starter-data-mongodb` |
| `zod` | Request validation (body/params) + env validation | `spring-boot-starter-validation` (Jakarta) |
| `jsonwebtoken` | Sign/verify HS512 JWTs | `jjwt` |
| `bcryptjs` | Password hashing (compatible with Spring's BCrypt) | `BCryptPasswordEncoder` |
| `nodemailer` | Sends the OTP emails over SMTP | `spring-boot-starter-mail` |
| `helmet` | Secure HTTP headers | Spring Security defaults |
| `cors` | Cross-origin requests from the frontends | `@CrossOrigin` |
| `express-rate-limit` | Brute-force protection on login/register/OTP | — (new) |
| `pino`, `pino-http` | Fast structured JSON logging + request logs | Logback |

### Development

| Package | Purpose |
|---|---|
| `typescript`, `@types/*` | Static typing |
| `tsx` | Runs TypeScript directly with watch mode (`npm run dev`) |
| `vitest`, `supertest` | Test runner + HTTP assertions against the Express app |
| `pino-pretty` | Readable logs in development |
| `eslint`, `typescript-eslint`, `@eslint/js`, `globals` | Linting |
| `prettier` | Formatting |

---

## 6. Project structure

```
backend_ExpressJs/
├── src/
│   ├── server.ts              # entry: connect DB, listen, OTP cleanup job, graceful shutdown
│   ├── app.ts                 # builds the Express app (middleware, routes, error handling)
│   ├── config/
│   │   ├── env.ts             # loads + validates environment variables (Zod)
│   │   ├── db.ts              # Mongoose connect / disconnect
│   │   └── logger.ts          # pino logger
│   ├── constants/
│   │   ├── enums.ts           # AccountType, JobStatus, ApplicationStatus, NotificationStatus
│   │   └── messages.ts        # error texts (same as Spring's application.properties)
│   ├── models/                # Mongoose schemas — one per Spring @Document
│   │   ├── user.model.ts          # users
│   │   ├── profile.model.ts       # profiles (+ embedded experiences, certifications)
│   │   ├── job.model.ts           # jobs (+ embedded applicants)
│   │   ├── notification.model.ts  # notification
│   │   ├── otp.model.ts           # otp
│   │   └── sequence.model.ts      # sequence (auto-increment ids) + nextSequenceId()
│   ├── validators/            # Zod schemas for request bodies / params
│   ├── middlewares/
│   │   ├── authenticate.ts    # JWT check -> req.user, requireRole()
│   │   ├── validate.ts        # runs Zod schemas, 400 on failure
│   │   ├── rate-limit.ts      # login / OTP limiters
│   │   └── error-handler.ts   # { errorMessage, errorCode, timeStamp } responses
│   ├── controllers/           # thin HTTP layer (one per Spring @RestController)
│   ├── services/              # business logic (one per Spring @Service) + token & mail
│   ├── routes/index.ts        # every route, its guards and validators in one place
│   ├── utils/
│   │   ├── app-error.ts       # AppError (Spring: JobPortalException)
│   │   └── mappers.ts         # document -> DTO (id, Base64, privacy filtering)
│   ├── templates/otp-email.ts # OTP email HTML (same as Spring's Data.getMessageBody)
│   └── types/auth.ts          # req.user typing
├── tests/                     # Vitest + Supertest integration tests
├── Jobify.postman_collection.json   # same collection as Spring — works against both
├── Dockerfile                 # multi-stage production image
├── .env.example
├── eslint.config.js · .prettierrc · tsconfig.json · tsconfig.build.json · vitest.config.ts
└── package.json
```

---

## 7. Architecture & request flow

```
request
  → helmet → cors → express.json (10 MB, for Base64 resumes/pictures) → pino-http logging
  → router
      → [rate limiter]            public auth / OTP routes
      → authenticate              JWT -> loads the user from MongoDB -> req.user
      → requireRole('EMPLOYER')   where needed (ADMIN always passes)
      → validate({ body, params })  Zod -> res.locals.body / res.locals.params
      → controller                 reads input, calls the service, sends the status code
      → service                    business rules, ownership checks, Mongoose queries
      → mappers                    document -> JSON shaped like the Spring DTOs
  → errorHandler                   AppError / validation / unexpected -> { errorMessage, errorCode, timeStamp }
```

* **Layering mirrors Spring:** `routes` ≈ request mappings, `controllers` ≈ `@RestController`,
  `services` ≈ `@Service`, `models` ≈ `@Document` + repositories, `mappers` ≈ `toDTO()`.
* **Errors:** services `throw new AppError('JOB_NOT_FOUND')`; Express 5 forwards thrown/rejected
  errors to `errorHandler`, so there is no try/catch boilerplate in controllers.
* **IDs:** numeric ids come from the shared `sequence` collection (`nextSequenceId('jobs')`), exactly
  like Spring's `Utilities.getNextSequenceId`.

---

## 8. API reference

Protected routes need `Authorization: Bearer <jwt>`. Errors always look like:

```json
{ "errorMessage": "Job not found.", "errorCode": 404, "timeStamp": "2026-10-02T09:17:28.130Z" }
```

### Auth & users (public)

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `200 { jwt }` |
| POST | `/users/register` | `{ name, email, password, accountType }` | `201` user (password `null`) |
| POST | `/users/sendOtp/:email` | — | `200 { message }` |
| GET | `/users/verifyOtp/:email/:otp` | — | `202 { message }` |
| POST | `/users/changePass` | `{ email, password }` (after OTP verified) | `200 { message }` |
| POST | `/users/login` 🔒 | `{ email, password }` | `200` user (legacy, no token) |

Password rule (same as Spring): 8–15 chars with an uppercase, a lowercase, a digit and one of `@#$%^&+=!`.

### Jobs 🔒

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/jobs/getAll` | any user | applicants' personal data only visible to the job owner |
| GET | `/jobs/get/:id` | any user | same privacy rule |
| POST | `/jobs/post` | EMPLOYER | `id` 0/missing = create (`201`), otherwise update (owner only) |
| POST | `/jobs/postAll` | EMPLOYER | bulk create (seeding) |
| POST | `/jobs/apply/:id` | APPLICANT | `{ name, email, phone, website, resume(Base64), coverLetter }` |
| GET | `/jobs/postedBy/:userId` | that employer | |
| GET | `/jobs/history/:userId/:status` | that applicant | status = `APPLIED\|INTERVIEWING\|OFFERED\|REJECTED` |
| POST | `/jobs/changeAppStatus` | job owner | `{ id, applicantId, applicationStatus, interviewTime? }` |

### Profiles 🔒

| Method | Path | Who |
|---|---|---|
| GET | `/profiles/get/:id` | any user |
| GET | `/profiles/getAll` | any user |
| PUT | `/profiles/update` | the profile's owner (full profile in the body, `picture` as Base64) |

### Notifications 🔒

| Method | Path | Who |
|---|---|---|
| GET | `/notification/get/:userId` | that user — unread notifications |
| PUT | `/notification/read/:id` | the notification's owner |

### Other

| Method | Path | |
|---|---|---|
| GET | `/health` | `200 {"status":"UP","database":"UP"}` or `503` when MongoDB is down |

**Postman:** import `Jobify.postman_collection.json`, set `baseUrl` to `http://localhost:8080`,
run *Auth › Login* (it stores the token), then call any request.

---

## 9. Compatibility with the Spring Boot backend

| Area | How it matches |
|---|---|
| Collections | `users`, `profiles`, `jobs`, `notification`, `otp`, `sequence` — same names and field names |
| IDs | numeric `_id` from the shared `sequence` counters → no collisions when both backends write |
| Binary data | resumes / pictures stored as BSON binary (Spring `byte[]`), exchanged as Base64 |
| Dates | stored as BSON dates; returned as ISO-8601 UTC strings (`2026-10-10T05:00:00.000Z`) |
| Passwords | BCrypt — Spring's `$2a$` hashes verify in Express and Express's `$2b$` hashes verify in Spring |
| JWT | HS512, claims `sub`(email) `id` `name` `accountType` `profileId`, 10 h validity. Like jjwt, the `JWT_SECRET` is **Base64-decoded** into the key, so a shared secret = shared tokens |
| Errors | `{ errorMessage, errorCode, timeStamp }` with the same message texts |
| Status codes | `201` register / post job, `202` verify OTP, `200` otherwise |

**Verified end-to-end:** both servers were run side by side against one database: users registered
on one logged in on the other, tokens were swapped between them, a job posted on Spring was applied
to on Express (resume bytes identical), status changes, profile pictures and notifications all
round-tripped.

> **Tip:** generate the shared secret as real Base64 so both libraries decode it identically:
> `openssl rand -base64 64` (or `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`).

### Intentional differences

| Spring Boot | Express | Why |
|---|---|---|
| Business errors return **500** | Proper codes: 400 / 403 / 404 / 409 | standard REST semantics; the frontends only read `errorMessage` |
| Failed login returns `errorMessage: null` (missing message key) | `400 "Invalid Credentials."` | the UI can show the reason; not 401, which the frontends treat as "session expired" |
| Unauthenticated → plain text `Access Denied !!…` | JSON error body, still **401** | consistent error format |
| `changeAppStatus` message "Status Chhanged…" | "Status Changed Successfully" | typo fixed |
| Dates serialised without timezone | ISO-8601 with `Z` | unambiguous; browsers parse both |

---

## 10. Security improvements over the Spring version

1. **Password reset requires a verified OTP.** In Spring, `POST /users/changePass` is public and
   never checks the OTP, so anyone could reset anyone's password. Express only accepts it within
   10 minutes after `verifyOtp` succeeded for that email, then deletes the OTP (one-time use).
   The frontends already call `sendOtp → verifyOtp → changePass`, so nothing changes for them.
2. **Ownership checks.** Users can only update their own profile, read their own notifications
   and history; only a job's owner can edit it or change its applicants' status (ADMIN bypasses).
3. **Role checks.** Only EMPLOYER can post jobs, only APPLICANT can apply.
4. **Identity from the token.** `postedBy` and `applicantId` are taken from the JWT, never trusted
   from the request body.
5. **Applicant privacy.** `/jobs/getAll` and `/jobs/get/:id` no longer expose other applicants'
   resumes, emails and phone numbers — only the job owner sees them (counts still work).
6. **Edits can't wipe data.** Updating a job keeps its applicants even if the client omits them.
7. **Closed/draft jobs can't be applied to.**
8. **Rate limiting** on login, register and OTP endpoints; **helmet** security headers;
   `X-Powered-By` disabled; request logs redact the `Authorization` header.
9. **Same response for unknown email and wrong password** (no account enumeration).
10. The new password in a reset must follow the registration password rule.

---

## 11. Spring Boot → Express mapping

| Spring Boot (`backend_springBoot/src/main/java/com/jobportal`) | Express (`backend_ExpressJs/src`) |
|---|---|
| `JobPortalApplication.java` | `server.ts` |
| `SecurityConfig.java`, `MyConfig.java` | `app.ts`, `routes/index.ts`, `middlewares/authenticate.ts` |
| `jwt/JwtHelper.java` | `services/token.service.ts` |
| `jwt/JwtAuthenticationFilter.java`, `JwtAuthenticationEntryPoint.java` | `middlewares/authenticate.ts` |
| `api/*API.java` | `controllers/*.controller.ts` + `routes/index.ts` |
| `service/*ServiceImpl.java` | `services/*.service.ts` |
| `entity/*.java` + `repository/*.java` | `models/*.model.ts` |
| `dto/*DTO.java` (`toDTO` / `toEntity`) | `utils/mappers.ts` + `validators/*.schemas.ts` |
| `dto/AccountType`, `JobStatus`, … | `constants/enums.ts` |
| `exception/JobPortalException.java` | `utils/app-error.ts` |
| `utility/ExceptionControllerAdvice.java`, `ErrorInfo.java` | `middlewares/error-handler.ts` |
| `utility/Utilities.java` (sequence, OTP) | `models/sequence.model.ts`, `services/user.service.ts` |
| `utility/Data.java` (email HTML) | `templates/otp-email.ts` |
| `application.properties` messages | `constants/messages.ts` |
| `@Scheduled removeExpiredOTPs` | `setInterval` in `server.ts` |
| `@Valid` + Jakarta annotations | Zod schemas + `validate()` middleware |

---

## 12. Testing

```bash
npm test
```

* 19 integration tests (Vitest + Supertest) run against the real Express app and a real MongoDB:
  registration/validation, JWT claims & Spring-compatible signing, OTP password reset, job posting,
  applying, privacy filtering, ownership/role checks, status changes, profile updates, notifications.
* Tests use the database **`jobportal_express_test`** on `mongodb://127.0.0.1:27017` and drop it
  before/after. They **refuse to run** against any database whose name doesn't end in `_test`.
* Use another MongoDB (e.g. Docker in CI):
  ```bash
  MONGODB_TEST_URI=mongodb://localhost:27018/jobportal_express_test npm test
  ```

---

## 13. Deployment

### Docker

```bash
docker build -t jobhook-express-api .
docker run -p 8080:8080 --env-file .env jobhook-express-api
```

The image is multi-stage (compiles TypeScript, then ships only `dist/` + production dependencies)
and runs as the non-root `node` user.

### Render / Railway / any Node host

* **Build command:** `npm ci && npm run build`
* **Start command:** `npm start`
* **Environment:** `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `MAIL_USERNAME`,
  `MAIL_PASSWORD` (and optionally `CORS_ORIGINS=https://your-frontend.app`).
* **Health check path:** `/health`
* Use the **same `MONGODB_URI` and `JWT_SECRET` as the Spring deployment** to share users and data.

---

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `Invalid environment variables` on start | Check `.env` against `.env.example` (e.g. `JWT_SECRET` must be ≥ 32 chars) |
| `JWT_SECRET must be set in production` | Set it in the hosting dashboard |
| `MongooseServerSelectionError` | MongoDB isn't running or `MONGODB_URI` is wrong; for Atlas, allow your IP |
| Logged out right after logging in on the other backend | Both backends must use the same `JWT_SECRET` (Base64 recommended) |
| OTP email never arrives | Use a Gmail **App Password**; in development without mail settings the OTP is in the server log |
| `Verify the OTP sent to your email…` on password reset | Call `verifyOtp` first; the reset is valid for 10 minutes |
| `413 Request body is too large` | Resumes/pictures over ~7 MB (10 MB of Base64) are rejected |
| `429 Too many requests` | Rate limit hit — wait 15 minutes |
| Port 8080 in use (Spring is running) | Set `PORT=8081` in `.env` |
| `npm install` fails with `edgesOut` | npm 10 bug — run `npm install` again, or `npm install --legacy-peer-deps` |
