#!/bin/bash

REPOURL=$(cat package.json | jq -r .repository.url | cut -d '+' -f 2)
REPOBRANCH=$(cat package.json | jq -r .repository.ghbranch)

if [ $REPOURL ] && [ $REPOBRANCH ]
then
  rm -rf .publish
  mkdir .publish
  cp -r ./build/* ./.publish
  cp -r ./.circleci ./.publish/.circleci
  cd .publish
  git init
  git remote add origin git@github.com:cytaty/cytaty.github.io.git
  git checkout -b $REPOBRANCH
  git add .
  git commit -m "Update $(date +"%FT%XZ")"
  git status
  git push origin $REPOBRANCH -f
  cd ..
  rm -rf .publish
else
  echo "Please specify origin and branch in package.json"
fi
