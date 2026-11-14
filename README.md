# Job Portal (oneKampus Jobs)

Full-stack job portal: React.js web app + Spring Boot API + MongoDB Atlas, plus Angular, Next.js and React Native clients.

## Live

| Part | URL | Hosting |
| --- | --- | --- |
| Web app (React) | https://jobs.onekampus.com (jobpilotai.site redirects here) | AWS Lightsail (Caddy, static files) |
| API (Spring Boot) | https://jobs-api.onekampus.com | AWS Lightsail (Docker + Caddy HTTPS) |
| Database | MongoDB Atlas | — |

## Project layout

- `JobFrontendApp/JobWebApp/frontend_ReactJs` — main web app (the live site). API URL: `REACT_APP_API_URL` (defaults to the live API).
- `JobFrontendApp/JobWebApp/frontend_Angular`, `frontend_NextJs` — alternative web clients.
- `JobFrontendApp/JobMobileApp` — React Native apps.
- `JobBackendApp/backend_springBoot` — the live API. Deploy guide: [DEPLOY-LIGHTSAIL.md](JobBackendApp/backend_springBoot/DEPLOY-LIGHTSAIL.md).
- `JobBackendApp/backend_ExpressJs` — drop-in Express.js version of the same API.
- `JobBackendApp/backend_microservices` — the same API split into microservices (Spring Cloud gateway, Eureka, config server, 4 services, RabbitMQ, database per service), runs locally with Docker Compose. See its [README](JobBackendApp/backend_microservices/README.md).
