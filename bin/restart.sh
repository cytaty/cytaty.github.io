#!/bin/bash
git fetch --all &&
git reset --hard origin/master &&
docker-compose down &&
docker-compose up -d --build
