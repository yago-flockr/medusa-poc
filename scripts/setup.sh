#!/usr/bin/env bash
# Installs the tools this repo needs on a fresh Ubuntu machine.
# Each tool: install if missing, then print its version. Safe to re-run.
set -euo pipefail

NODE_MAJOR=22

CYAN=$'\033[0;36m' RESET=$'\033[0m'
printVersion() { printf "${CYAN}%-8s${RESET}%s\n" "$1" "$2"; }

ensureAptPackage() {
  command -v "$1" >/dev/null && return
  sudo apt-get update -y -qq
  sudo apt-get install -y -qq "$1"
}

setupGit() {
  ensureAptPackage git
  printVersion "git" "$(git --version)"
}

setupCurl() {
  ensureAptPackage curl
  printVersion "curl" "$(curl --version | head -n1)"
}

setupNvm() {
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    local latest
    latest="$(curl -fsSL https://api.github.com/repos/nvm-sh/nvm/releases/latest | grep -oP '"tag_name":\s*"\K[^"]+')"
    curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$latest/install.sh" | bash
  fi
  # shellcheck disable=SC1091
  \. "$NVM_DIR/nvm.sh"
  printVersion "nvm" "$(nvm --version)"
}

setupNode() {
  local major="${1:-22}"
  if ! command -v node >/dev/null || [ "$(node -v | tr -d v | cut -d. -f1)" -lt "$major" ]; then
    nvm install "$major" >/dev/null
    nvm alias default "$major" >/dev/null
  fi
  printVersion "node" "$(node -v)"
}

setupPnpm() {
  command -v pnpm >/dev/null || { corepack enable; corepack prepare pnpm@latest --activate; }
  printVersion "pnpm" "$(pnpm -v)"
}

setupDocker() {
  if ! command -v docker >/dev/null; then
    curl -fsSL https://get.docker.com | sudo sh >/dev/null
    sudo usermod -aG docker "$USER"
  fi
  docker compose version >/dev/null 2>&1 || sudo apt-get install -y -qq docker-compose-plugin
  printVersion "docker" "$(docker --version)"
}

main() {
  setupGit
  setupCurl
  setupNvm
  setupNode "$NODE_MAJOR"
  setupPnpm
  setupDocker
}

main
