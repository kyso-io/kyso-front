#!/bin/sh
# vim:ts=2:sw=2:et:ai:sts=2

set -e

# Relative PATH to the workdir from this script (usually . or .., empty means .)
RELPATH_TO_WORKDIR=".."

# Variables
IMAGE_NAME="registry.kyso.io/docker/node-builder"
IMAGE_TAG="16.16.0-bullseye-slim"
CONTAINER_NAME="kyso-front-builder"
BUILDER_TAG="$IMAGE_NAME:$IMAGE_TAG"
HOSTS_FILE=".hosts.docker"
NPMRC_KYSO=".npmrc.kyso"
NPMRC_DOCKER=".npmrc.docker"
ENV_DOCKER=".env.docker"
CONTAINER_VARS=""
PUBLISH_PORTS="--publish 0.0.0.0:3000:3000"

# ---------
# FUNCTIONS
# ---------

# POSIX compliant version of readlinkf (MacOS does not have coreutils) copied
# from https://github.com/ko1nksm/readlinkf/blob/master/readlinkf.sh
_readlinkf_posix() {
  [ "${1:-}" ] || return 1
  max_symlinks=40
  CDPATH='' # to avoid changing to an unexpected directory
  target=$1
  [ -e "${target%/}" ] || target=${1%"${1##*[!/]}"} # trim trailing slashes
  [ -d "${target:-/}" ] && target="$target/"
  cd -P . 2>/dev/null || return 1
  while [ "$max_symlinks" -ge 0 ] && max_symlinks=$((max_symlinks - 1)); do
    if [ ! "$target" = "${target%/*}" ]; then
      case $target in
      /*) cd -P "${target%/*}/" 2>/dev/null || break ;;
      *) cd -P "./${target%/*}" 2>/dev/null || break ;;
      esac
      target=${target##*/}
    fi
    if [ ! -L "$target" ]; then
      target="${PWD%/}${target:+/}${target}"
      printf '%s\n' "${target:-/}"
      return 0
    fi
    # `ls -dl` format: "%s %u %s %s %u %s %s -> %s\n",
    #   <file mode>, <numbur of links>, <owner name>, <group name>,
    #   <size>, <date and time>, <pathname of link>, <contents of link>
    # https://pubs.opengroup.org/onlinepubs/9699919799/utilities/ls.html
    link=$(ls -dl -- "$target" 2>/dev/null) || break
    target=${link#*" $target -> "}
  done
  return 1
}

# Change to working directory (script dir + the value of RELPATH_TO_WORKDIR)
cd_to_workdir() {
  _script="$(_readlinkf_posix "$0")"
  _script_dir="${_script%/*}"
  if [ "$RELPATH_TO_WORKDIR" ]; then
    cd "$(_readlinkf_posix "$_script_dir/$RELPATH_TO_WORKDIR")"
  else
    cd "$_script_dir"
  fi
}

docker_setup() {
  if [ ! -f "$NPMRC_KYSO" ]; then
    PACKAGE_READER_TOKEN=""
    echo "Please, create a personal access token with read_api scope"
    echo "URL: https://gitlab.kyso.io/-/profile/personal_access_tokens"
    while [ -z "$PACKAGE_READER_TOKEN" ]; do
      printf "Token value: "
      read -r PACKAGE_READER_TOKEN
    done
    cat >"$NPMRC_KYSO" <<EOF

@kyso-io:registry=https://gitlab.kyso.io/api/v4/packages/npm/
//gitlab.kyso.io/api/v4/packages/npm/:_authToken=${PACKAGE_READER_TOKEN}
EOF
  fi
  if [ ! -f "$ENV_DOCKER" ]; then
    echo "Copying the sample ./.env file to $ENV_DOCKER"
    cp "./.env" "$ENV_DOCKER"
    echo "Adjust values for your setup!!!"
  fi
}

docker_logs() {
  docker logs "$@" "$CONTAINER_NAME"
}

docker_pull() {
  docker pull "$BUILDER_TAG"
}

docker_rm() {
  docker rm "$CONTAINER_NAME"
}

docker_run() {
  if [ -n "$*" ]; then
    CONTAINER_COMMAND="$*"
  else
    CONTAINER_COMMAND="npm install && npm run dev"
  fi
  if [ ! -f "./.npmrc.kyso" ]; then
    echo "Missing file '.npmrc.kyso', call $0 init to create it"
    exit 1
  fi
  if [ "$(docker_status)" ]; then
    docker rm "$CONTAINER_NAME"
  fi
  HOSTS=""
  if  [ -f "$HOSTS_FILE" ]; then
    while read -r _host _ip; do
      HOSTS="$HOSTS --add-host $_host:$_ip"
    done <<EOF
$(grep -v "^#" "$HOSTS_FILE")
EOF
  fi
  # Prepare .npmrc.docker
  if [ -f ".npmrc" ]; then
    cat ".npmrc" "$NPMRC_KYSO" >"$NPMRC_DOCKER"
  else
    cat "$NPMRC_KYSO" >"$NPMRC_DOCKER"
  fi
  VOLUMES="-v $(pwd)/:/app/"
  VOLUMES="$VOLUMES -v $(pwd)/$ENV_DOCKER:/app/.env"
  VOLUMES="$VOLUMES -v $(pwd)/.npmrc.kyso:/app/.npmrc"
  VOLUMES="$VOLUMES --tmpfs /data"
  WORKDIR="-w /app"
  DOCKER_COMMAND="$(
    printf "%s" \
      "docker run -d --restart always --user '$(id -u):$(id -g)' " \
      "--name '$CONTAINER_NAME' $CONTAINER_VARS $PUBLISH_PORTS $HOSTS " \
      "$VOLUMES $WORKDIR '$BUILDER_TAG' /bin/sh -c '$CONTAINER_COMMAND'"
  )"
  eval "$DOCKER_COMMAND"
}

docker_sh() {
  _user="$1"
  shift
  if [ "$_user" = "root" ]; then
    if [ -z "$*" ]; then
      docker exec -u 0:0 -ti "$CONTAINER_NAME" /bin/bash
    else
      docker exec -u 0:0 -ti "$CONTAINER_NAME" /bin/sh -c "$*"
    fi
  else
    if [ -z "$*" ]; then
      docker exec -ti "$CONTAINER_NAME" /bin/bash
    else
      docker exec -ti "$CONTAINER_NAME" /bin/sh -c "$*"
    fi
  fi
}

docker_status() {
  docker ps -a -f name="${CONTAINER_NAME}" --format '{{.Status}}' 2>/dev/null ||
    true
}

docker_stop() {
  docker stop "$CONTAINER_NAME"
  docker rm "$CONTAINER_NAME"
}

usage() {
  cat <<EOF
Usage: $0 CMND [ARGS]

Where CMND can be one of:
- pull: pull latest version of the builder container image
- setup: prepare local files (.npmrc.kyso & .env.docker)
- start: launch container in daemon mode with the right settings
- stop|status|rm|logs: operations on the container
- sh: execute interactive shell (/bin/bash) on the running container
- shr: execute interactive shell (/bin/bash) as root on the running container
EOF
}

# ----
# MAIN
# ----

cd_to_workdir
echo "WORKING DIRECTORY = '$(pwd)'"
echo ""

case "$1" in
pull) docker_pull ;;
logs) shift && docker_logs "$@" ;;
rm) docker_rm ;;
setup) docker_setup ;;
sh) shift && docker_sh "" "$@" ;;
shr) shift && docker_sh "root" "$@" ;;
start) shift && docker_run "$@" ;;
status) docker_status ;;
stop) docker_stop ;;
*) usage ;;
esac
