# Backend — Deep Dive (Spring Boot)

The REST API for the **Jobify** job portal. Spring Boot 3 + MongoDB + JWT, serving both the
web and mobile clients. This document explains the backend in detail; for the whole-system
overview see `../project-explain.md`.

---

## 1. Tech stack & libraries

| Library / Starter | Version | Why it's used |
|---|---|---|
| `spring-boot-starter-parent` | 3.3.2 | Base Spring Boot platform (Java **17**) |
| `spring-boot-starter-web` | (managed) | REST controllers, embedded Tomcat, Jackson JSON |
| `spring-boot-starter-data-mongodb` | (managed) | MongoDB persistence (repositories, `MongoTemplate`) |
| `spring-boot-starter-security` | (managed) | Authentication/authorization, password encoding |
| `spring-boot-starter-validation` | (managed) | Bean Validation (`@NotBlank`, `@Email`, `@Pattern`) |
| `spring-boot-starter-mail` | (managed) | Sends OTP emails (Gmail SMTP) |
| `io.jsonwebtoken:jjwt-api/impl/jackson` | 0.11.5 | Create & verify JWTs (HS512) |
| `org.projectlombok:lombok` | (managed) | Boilerplate reduction (`@Data`, getters/setters) |
| `spring-boot-devtools` | (managed) | Hot reload in development |

Build tool: **Maven** (`pom.xml`, `mvnw` wrapper). Run plugin: `spring-boot-maven-plugin`.

---

## 2. Layered architecture

```
HTTP request
   │
   ▼
api/ (@RestController)      ← endpoints, @Valid request DTOs, @CrossOrigin
   │
   ▼
service/ (interface + Impl) ← business rules (apply once, status transitions, OTP, email)
   │
   ▼
repository/ (MongoRepository) ← data access
   │
   ▼
MongoDB  (users · jobs · profiles · notification · otp · sequence)
```

- **DTO vs Entity**: `dto/*` objects cross the wire (JSON); `entity/*` objects persist.
  Example: `resume` / `picture` are **base64 `String`** in DTOs but `byte[]` in entities.
- **Service interface + `*Impl`** pattern keeps controllers thin and logic testable/swappable.

---

## 3. Package-by-package map (`com.jobportal`)

| Package | Key classes | Responsibility |
|---|---|---|
| (root) | `JobPortalApplication` | Spring Boot entry point (`main`) |
| (root) | `SecurityConfig` | Security filter chain, public allow-list, stateless sessions, `PasswordEncoder`, `AuthenticationManager` |
| (root) | `MyConfig` | App-level beans/config |
| `api` | `AuthAPI`, `UserAPI`, `JobAPI`, `ProfileAPI`, `NotificationAPI` | REST controllers |
| `service` | `JobService(Impl)`, `UserService(Impl)`, `ProfileService(Impl)`, `NotificationService(Impl)` | Business logic |
| `repository` | `UserRepository`, `JobRepository`, `ProfileRepository`, `NotificationRepository`, `OTPRepository` | Spring Data Mongo repositories |
| `entity` | `User`, `Job`, `Applicant`, `Profile`, `Notification`, `OTP`, `Sequence` | MongoDB documents |
| `dto` | `UserDTO`, `JobDTO`, `ApplicantDTO`, `Application`, `ProfileDTO`, `Experience`, `Certification`, `NotificationDTO`, `LoginDTO`, `ResponseDTO`, enums | Wire models |
| `dto` (enums) | `AccountType`, `JobStatus`, `ApplicationStatus`, `NotificationStatus` | Domain enums |
| `jwt` | `JwtHelper`, `JwtAuthenticationFilter`, `JwtAuthenticationEntryPoint`, `MyUserDetailsService`, `CustomUserDetails`, `AuthenticationRequest/Response` | JWT auth machinery |
| `exception` | `JobPortalException` | Domain exception |
| `utility` | `ExceptionControllerAdvice`, `ErrorInfo`, `Utilities`, `Data` | Global error handling, ID sequence, helpers |

---

## 4. Security & JWT (the headline feature)

**Classes:** `SecurityConfig`, `jwt/JwtAuthenticationFilter`, `jwt/JwtHelper`,
`jwt/MyUserDetailsService`, `jwt/CustomUserDetails`, `jwt/JwtAuthenticationEntryPoint`.

**Login → token:**
1. `POST /auth/login` (`AuthAPI`) with `AuthenticationRequest {email, password}`.
2. `AuthenticationManager` authenticates against `MyUserDetailsService` (loads user, bcrypt check).
3. `JwtHelper` signs a **HS512** JWT — subject = email; claims `id`, `name`, `accountType`,
   `profileId`; validity ≈ **10 hours**. Response: `AuthenticationResponse {jwt}`.

**Protected request → context:**
1. Client sends `Authorization: Bearer <jwt>`.
2. `JwtAuthenticationFilter` (a `OncePerRequestFilter`) extracts/validates the token and sets
   the `SecurityContext`.
3. `SecurityConfig`: **stateless** sessions, CSRF off, CORS on; everything authenticated
   except the public allow-list:
   `/auth/login`, `/users/register`, `/users/sendOtp/**`, `/users/verifyOtp/**`, `/users/changePass`.
4. `JwtAuthenticationEntryPoint` handles unauthenticated access.

> **Honest design note (good interview point):** roles are stored (`accountType`) but the
> backend authorizes all-or-nothing — any authenticated user can call any protected endpoint.
> Role separation is enforced on the clients. Improvement: method security with
> `@PreAuthorize("hasRole('EMPLOYER')")`.

---

## 5. Domain model

**Entities** (collections): `users`, `jobs`, `profiles`, `notification`, `otp`, plus a
`sequence` collection backing numeric IDs.

- **User** — `id, name, email (unique), password (bcrypt), accountType, profileId`.
- **Profile** — `id, name, email, jobTitle, company, location, about, picture(byte[]),
  totalExp, skills[], experiences[Experience], certifications[Certification], savedJobs[Long]`.
- **Job** — `id, jobTitle, company, applicants[Applicant], about, experience, jobType,
  location, packageOffered, postTime, description, skillsRequired[], jobStatus, postedBy`.
- **Applicant (embedded in Job)** — `applicantId, name, email, phone, website, resume(byte[]),
  coverLetter, timestamp, applicationStatus, interviewTime`.
- **Notification** — `id, userId, message, action, route, status, timestamp`.
- **OTP** — `email(id), otpCode, creationTime`.

**Enums:** `AccountType {APPLICANT, EMPLOYER, ADMIN}` · `JobStatus {ACTIVE, DRAFT, CLOSED}` ·
`ApplicationStatus {APPLIED, INTERVIEWING, OFFERED, REJECTED}` · `NotificationStatus {READ, UNREAD}`.

---

## 6. Endpoints (controller → purpose, auth)

| Controller | METHOD PATH | Purpose | Auth |
|---|---|---|---|
| AuthAPI | `POST /auth/login` | Login → `{ jwt }` | No |
| UserAPI | `POST /users/register` | Register + auto-create profile | No |
| UserAPI | `POST /users/login` | Login → UserDTO | (token) |
| UserAPI | `POST /users/changePass` | Reset password | No |
| UserAPI | `POST /users/sendOtp/{email}` | Email a 6-digit OTP | No |
| UserAPI | `GET /users/verifyOtp/{email}/{otp}` | Verify OTP | No |
| JobAPI | `POST /jobs/post` | Create/update a job | Yes |
| JobAPI | `POST /jobs/postAll` | Bulk create | Yes |
| JobAPI | `GET /jobs/getAll` | List jobs | Yes |
| JobAPI | `GET /jobs/get/{id}` | One job | Yes |
| JobAPI | `POST /jobs/apply/{id}` | Apply to a job | Yes |
| JobAPI | `GET /jobs/postedBy/{id}` | Employer's jobs | Yes |
| JobAPI | `GET /jobs/history/{id}/{status}` | Applicant history by status | Yes |
| JobAPI | `POST /jobs/changeAppStatus` | Move applicant in pipeline | Yes |
| ProfileAPI | `GET /profiles/get/{id}` | One profile | Yes |
| ProfileAPI | `GET /profiles/getAll` | All profiles (Find Talent) | Yes |
| ProfileAPI | `PUT /profiles/update` | Update profile | Yes |
| NotificationAPI | `GET /notification/get/{userId}` | Unread notifications | Yes |
| NotificationAPI | `PUT /notification/read/{id}` | Mark read | Yes |

(See `Jobify.postman_collection.json` to try them all.)

---

## 7. Notable implementation details (interview gold)

- **Custom numeric IDs** — `utility/Utilities.getNextSequenceId(...)` + `entity/Sequence`
  generate auto-incrementing `Long` ids instead of Mongo ObjectIds (cleaner URLs/keys).
- **OTP password reset** — `sendOtp` emails a 6-digit code via `spring-boot-starter-mail`,
  stored in the `otp` collection with a timestamp; a **scheduled task** purges expired OTPs
  (5-minute lifetime); `verifyOtp` validates (`@Pattern ^[0-9]{6}$`); `changePass` updates the
  bcrypt hash.
- **Embedded applicants** — applications live *inside* the Job document, so reading "applicants
  of a job" needs no join (trade-off: document growth).
- **Global exception handling** — `utility/ExceptionControllerAdvice` (`@ControllerAdvice`):
  `JobPortalException` → HTTP 500 with `ErrorInfo {errorMessage, errorCode, timeStamp}`;
  validation failures → HTTP 400. Messages are externalized in `application.properties` /
  `ValidationMessages.properties`.
- **CORS** — `@CrossOrigin` per controller so the browser client can call the API.
- **Validation** — DTOs use Bean Validation; e.g. password regex enforces 8–15 chars with
  upper/lower/digit/special.

---

## 8. Configuration (`src/main/resources/application.properties`)

- Server port **8080** (default), no context path.
- MongoDB: `mongodb://localhost:27017/jobportal`.
- Gmail SMTP for OTP email (host/port/credentials).
- Externalized error & validation messages.

> Security note to mention proactively: secrets (JWT key, mail credentials) currently live in
> `application.properties` — in production they'd move to environment variables / a secrets
> manager.

---

## 9. Run it

```bash
cd backend
# ensure MongoDB is running on 27017
./mvnw spring-boot:run      # or:  mvnw.cmd spring-boot:run   (Windows)
# API on http://localhost:8080
```

Quick smoke test: `GET http://localhost:8080/jobs/getAll` returns **401** until you log in —
that confirms security is active.
