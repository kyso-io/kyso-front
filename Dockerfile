# Global Dockerfile Arguments (in our CI can be overriden in ./.build-args)
ARG BUILDER_IMG=registry.kyso.io/kyso-io/kyso
ARG BUILDER_TAG=builder
ARG SERVICE_IMG=registry.kyso.io/docker/node
ARG SERVICE_TAG=latest

# Builder image
FROM ${BUILDER_IMG}:${BUILDER_TAG} AS builder
# Install rimraf
RUN npm install -g rimraf 
# Change the working directory to /app
WORKDIR /app
# Copy files required to build the application
COPY . .
# Execute `npm ci` with an externally mounted npmrc
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc,required npm ci
# Now do the build
RUN npm run clean && npm run build
# Iff we are able to use the exported application we could add the following:
#   && npm run export
# and use the out/ dir as the exported application.

## Production image
FROM ${SERVICE_IMG}:${SERVICE_TAG} AS service
# Set the NODE_ENV value from the args
ARG NODE_ENV=production
## Export the NODE_ENV to the container environment
ENV NODE_ENV=${NODE_ENV}
### For security reasons don't run as root
USER node
### Change the working directory to /app
WORKDIR /app
## Copy the complete /app builder dir --- FIXME(sto): We have to check that!!!
COPY --chown=node:node --from=builder /app/. ./
## Disable next telemetry usage
ENV NEXT_TELEMETRY_DISABLED 1
## Run the compiled version
CMD ["npm", "run", "start"]
