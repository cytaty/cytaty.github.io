#!/bin/bash
git fetch --all &&
git reset --hard origin/server &&
docker-compose down &&
docker-compose up -d --build
