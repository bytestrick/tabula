#!/bin/sh

set -e
trap "kill %1 %2; exit 130" INT
backend/gradlew --project-dir backend bootRun &
npm install --prefix frontend && npm start --prefix frontend &
wait
