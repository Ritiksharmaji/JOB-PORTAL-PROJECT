#!/usr/bin/env bash
# Stop the stack. Add --volumes to also delete the MongoDB data.
cd "$(dirname "$0")/.." && docker compose down "$@"
