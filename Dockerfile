# Global Dockerfile Arguments (in our CI can be overriden in ./.build-args)
ARG BUILDER_IMG=registry.kyso.io/docker/node-builder
ARG BUILDER_TAG=latest

# Builder image
FROM ${BUILDER_IMG}:${BUILDER_TAG} AS builder
# Change the working directory to /app
WORKDIR /app
# Copy files required to build the application
COPY package.json ./
# Execute `npm install`
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc,uid=1000,gid=1000,required\
 npm install husky && npm install --omit=dev
