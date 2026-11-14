#!/usr/bin/env bash
# Build all jars, start the whole stack, and wait until every service is registered in Eureka.
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v mvn >/dev/null; then MVN=mvn; else MVN=./mvnw; fi
echo "==> Building jars"
"$MVN" -q -B -DskipTests package
echo "==> Starting containers"
docker compose up -d --build
echo "==> Waiting for services to register"
want="API-GATEWAY JOB-SERVICE NOTIFICATION-SERVICE PROFILE-SERVICE USER-SERVICE"
for i in $(seq 1 60); do
  got=$(curl -s -H 'Accept: application/json' localhost:8761/eureka/apps 2>/dev/null |
        python3 -c 'import sys,json;print(" ".join(sorted(a["name"] for a in json.load(sys.stdin)["applications"]["application"])))' 2>/dev/null || true)
  [ "$got" = "$want" ] && break
  sleep 5
done
echo "Registered: ${got:-none}"
echo "API gateway:  http://localhost:${GATEWAY_PORT:-8080}   (point the React app's REACT_APP_API_URL here)"
echo "Eureka:       http://localhost:8761"
echo "RabbitMQ:     http://localhost:15672  (guest / guest)"
