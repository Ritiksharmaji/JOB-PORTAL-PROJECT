# Deploying the API to AWS Lightsail

The live API runs at **https://jobs-api.onekampus.com** as a Docker container on the shared
Lightsail server `music-app` (ap-south-1, static IP `13.207.89.19`). Replaces the old Render deploy.

```text
Browser (www.jobpilotai.site, Amplify)
   │ HTTPS
   ▼
Caddy (music-app server, Let's Encrypt)  ──►  job-api container :8080  ──►  MongoDB Atlas
```

## Server layout

- `/opt/job-portal/` — `Dockerfile`, `docker-compose.yml`, `JobPortal.jar`, `.env` (secrets, chmod 600, never committed).
- The container joins the music app's Docker network `deploy_default` with the alias `job-api`.
- The music app's Caddy (`/opt/music-app/deploy/Caddyfile`) has this block:

  ```caddyfile
  jobs-api.onekampus.com {
  	encode gzip
  	reverse_proxy job-api:8080
  }
  ```
- JVM heap is capped at 256 MB (container limit 420 MB) so it fits on the 1 GB server.

## Environment (`/opt/job-portal/.env`)

`SPRING_DATA_MONGODB_URI`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD` — same variables as `.env.example`.

## Update the live API

From `JobBackendApp/backend_springBoot/`:

```bash
deploy/deploy.sh
```

It builds the jar locally, uploads it and restarts the container. Logs:

```bash
ssh -i ~/.ssh/music-app-lightsail.pem ubuntu@13.207.89.19 'docker logs -f job-portal-job-api-1'
```

## DNS

`jobs-api.onekampus.com` needs an **A record → 13.207.89.19** at the onekampus.com DNS provider
(it overrides the `*` wildcard that points to the site-platform server).
