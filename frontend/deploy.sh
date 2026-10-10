#!/bin/bash
set -e
cd "$(dirname "$0")"
npm install && npm run build
rm -rf ../src/main/resources/static/*
cp -r dist/* ../src/main/resources/static/
cd ..
./gradlew build -x test
echo "Deploy ready: java -jar build/libs/tripsplit-0.0.1-SNAPSHOT.jar"
