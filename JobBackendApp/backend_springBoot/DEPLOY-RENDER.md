# Deploying the Jobify Backend to Render

This backend is a Spring Boot app that needs a **cloud MongoDB** (Render has no local Mongo).
We'll use **MongoDB Atlas (free)** + **Render (free)**. A `Dockerfile` already exists, so we
deploy as a Docker web service.

---

## ⚠️ Do this first — rotate the leaked Gmail password

The old `application.properties` had a real Gmail App Password committed in git. It is now
**compromised**. Go to your Google Account → **Security → App passwords → revoke** the old one
and **create a new App Password**. Never commit it again — it's now read from an env var.

---

## Step 1 — Create a MongoDB Atlas cluster (free)

1. Sign up at https://www.mongodb.com/cloud/atlas → create a free **M0** cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (Render's outbound IPs are dynamic).
4. **Connect → Drivers** → copy the connection string, e.g.:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/jobportal?retryWrites=true&w=majority
   ```
   Make sure the **database name `jobportal`** is in the path (before the `?`).

## Step 2 — Push the repo to GitHub

Render deploys from a Git repo. Push the whole monorepo (the service lives in `/backend`).

## Step 3 — Create the Render web service

**Option A — Dashboard (recommended, most reliable for a monorepo)**
1. https://dashboard.render.com → **New + → Web Service** → connect your repo.
2. **Root Directory:** `backend`  ← important (this is a monorepo).
3. **Runtime/Language:** Render auto-detects the **Dockerfile** → keep "Docker".
4. **Instance type:** Free.
5. **Create Web Service**.

**Option B — Blueprint:** New + → **Blueprint** → pick the repo; it reads `backend/render.yaml`.

## Step 4 — Set environment variables

In the service → **Environment** → add:

| Key | Value |
|---|---|
| `SPRING_DATA_MONGODB_URI` | your Atlas connection string from Step 1 |
| `MAIL_USERNAME` | your Gmail address |
| `MAIL_PASSWORD` | the **new** Gmail App Password |
| `JWT_SECRET` | a long random string (e.g. 64+ chars) used to sign JWTs |

(`PORT` is provided by Render automatically — the app already reads it.)

Save → Render redeploys.

## Step 5 — Verify

- Watch **Logs** for `Started JobPortalApplication`.
- Your URL is `https://<service-name>.onrender.com`.
- `GET https://<service-name>.onrender.com/jobs/getAll` should return **401** (auth required) —
  that means it's running. Then test `POST /auth/login` with a registered user.

## Step 6 — Point the clients at the deployed API

- **Web** (`frontend`): set the base URL in `src/Interceptor/AxiosInterceptor.tsx` to your
  Render URL, rebuild/redeploy.
- **Mobile** (`mobile_frontend`): set `EXPO_PUBLIC_API_URL=https://<service-name>.onrender.com`
  in `.env`, then `npx expo start -c`. (HTTPS also avoids Android's cleartext-HTTP restriction.)

---

## Notes & gotchas

- **Free tier sleeps** after ~15 min idle; the next request triggers a ~50s cold start. Use a
  paid instance or an uptime pinger if you need it always warm.
- **CORS** is already open (`@CrossOrigin`), so the browser client can call it.
- **First Docker build is slow** (Maven downloads dependencies); later builds are cached.
- **Build memory:** if the free build runs out of memory, switch to the native build instead of
  Docker — Environment "Java", Build `./mvnw clean package -DskipTests`,
  Start `java -jar target/JobPortal-0.0.1-SNAPSHOT.jar`.
- **JWT secret:** now read from the `JWT_SECRET` env var (`jwt/JwtHelper.java`), with a dev-only
  default for local runs. Always set a fresh `JWT_SECRET` in production — if you change it, all
  previously issued tokens become invalid (users must log in again).
