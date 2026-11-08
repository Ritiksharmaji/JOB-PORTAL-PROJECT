#!/usr/bin/env bash
# Build and (re)deploy the job portal on the shared Lightsail server (apps-server, 16.4.118.190).
# Usage (from backend_springBoot/):  deploy/deploy.sh [api|web|all]   (default: api)
#   api -> https://jobs-api.onekampus.com   (container job-api in /opt/apps/compose.yml)
#   web -> https://jobpilotai.site          (React build served by Caddy from /opt/apps/sites/jobpilotai)
# Env overrides: DEPLOY_HOST (default ubuntu@16.4.118.190), SSH_KEY (default ~/.ssh/apps-server-lightsail.pem)
set -euo pipefail
WHAT="${1:-api}"
HOST="${DEPLOY_HOST:-ubuntu@16.4.118.190}"
KEY="${SSH_KEY:-$HOME/.ssh/apps-server-lightsail.pem}"
REMOTE=/opt/apps
cd "$(dirname "$0")/.."

if [[ "$WHAT" == api || "$WHAT" == all ]]; then
  echo "==> Building jar"
  if command -v mvn >/dev/null; then MVN=mvn; else
    MVN=$(ls -d "$HOME"/.m2/wrapper/dists/apache-maven-*/*/bin/mvn 2>/dev/null | tail -1)
  fi
  "$MVN" -q clean package -DskipTests
  scp -i "$KEY" deploy/Dockerfile "$HOST:$REMOTE/job-api/Dockerfile"
  scp -i "$KEY" target/JobPortal-0.0.1-SNAPSHOT.jar "$HOST:$REMOTE/job-api/JobPortal.jar"
  ssh -i "$KEY" "$HOST" "cd $REMOTE && test -f job-api/.env || { echo 'Missing $REMOTE/job-api/.env'; exit 1; }; docker compose up -d --build job-api && docker image prune -f >/dev/null"
  echo "==> API done: https://jobs-api.onekampus.com"
fi

if [[ "$WHAT" == web || "$WHAT" == all ]]; then
  echo "==> Building web"
  WEB=../../JobFrontendApp/JobWebApp/frontend_ReactJs
  (cd "$WEB" && npm run build >/dev/null)
  rsync -az --delete -e "ssh -i $KEY" "$WEB/build/" "$HOST:$REMOTE/sites/jobpilotai/"
  echo "==> Web done: https://jobpilotai.site"
fi
