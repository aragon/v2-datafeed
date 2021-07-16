#!/bin/sh
# use previously built image for cache if possible
DOCKERFILE_PATH="$1"
REPO="$2"
GITHUB_SHA="$3"
docker build $DOCKERFILE_PATH -t $REPO:${GITHUB_SHA} -t $REPO:rolling
docker push $REPO:${GITHUB_SHA}
docker push $REPO:rolling
