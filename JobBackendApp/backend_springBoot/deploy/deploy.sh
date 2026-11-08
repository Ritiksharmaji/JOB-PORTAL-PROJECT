#!/usr/bin/env bash
# Build the Spring Boot jar locally and (re)start the API on the Lightsail server.
# Usage (from backend_springBoot/):  deploy/deploy.sh
# Env overrides: DEPLOY_HOST (default ubuntu@13.207.89.19), SSH_KEY (default ~/.ssh/music-app-lightsail.pem)
set -euo pipefail

HOST="${DEPLOY_HOST:-ubuntu@13.207.89.19}"
KEY="${SSH_KEY:-$HOME/.ssh/music-app-lightsail.pem}"
REMOTE=/opt/job-portal
cd "$(dirname "$0")/.."

echo "==> Building jar"
if command -v mvn >/dev/null; then MVN=mvn; else
  MVN=$(ls -d "$HOME"/.m2/wrapper/dists/apache-maven-*/*/bin/mvn 2>/dev/null | tail -1)
fi
"$MVN" -q clean package -DskipTests

echo "==> Uploading to $HOST:$REMOTE"
ssh -i "$KEY" "$HOST" "sudo mkdir -p $REMOTE && sudo chown \$USER $REMOTE"
scp -i "$KEY" deploy/Dockerfile deploy/docker-compose.yml "$HOST:$REMOTE/"
scp -i "$KEY" target/JobPortal-0.0.1-SNAPSHOT.jar "$HOST:$REMOTE/JobPortal.jar"

echo "==> Restarting container"
ssh -i "$KEY" "$HOST" "cd $REMOTE && test -f .env || { echo 'Missing $REMOTE/.env'; exit 1; }; docker compose up -d --build && docker image prune -f >/dev/null"
echo "==> Done: https://jobs-api.onekampus.com"
