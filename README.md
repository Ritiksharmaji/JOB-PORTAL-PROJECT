# Job Portal (JobPilot AI)

Full-stack job portal: React.js web app + Spring Boot API + MongoDB Atlas, plus Angular, Next.js and React Native clients.

## Live

| Part | URL | Hosting |
| --- | --- | --- |
| Web app (React) | https://www.jobpilotai.site | AWS Amplify |
| API (Spring Boot) | https://jobs-api.onekampus.com | AWS Lightsail (Docker + Caddy HTTPS) |
| Database | MongoDB Atlas | — |

## Project layout

- `JobFrontendApp/JobWebApp/frontend_ReactJs` — main web app (the live site). API URL: `REACT_APP_API_URL` (defaults to the live API).
- `JobFrontendApp/JobWebApp/frontend_Angular`, `frontend_NextJs` — alternative web clients.
- `JobFrontendApp/JobMobileApp` — React Native apps.
- `JobBackendApp/backend_springBoot` — the live API. Deploy guide: [DEPLOY-LIGHTSAIL.md](JobBackendApp/backend_springBoot/DEPLOY-LIGHTSAIL.md).
- `JobBackendApp/backend_ExpressJs` — drop-in Express.js version of the same API.
