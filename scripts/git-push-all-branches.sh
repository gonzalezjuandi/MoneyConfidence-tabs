#!/usr/bin/env bash
# Sube main, v1 y v2 a GitHub. No guardes el token en archivos.
# Uso:
#   export GITHUB_TOKEN="ghp_xxxxxxxx"   # o fine-grained PAT
#   ./scripts/git-push-all-branches.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Define GITHUB_TOKEN con tu Personal Access Token (repo)." >&2
  exit 1
fi
OWNER_REPO="gonzalezjuandi/MoneyConfidence-tabs"
URL="https://${GITHUB_TOKEN}@github.com/${OWNER_REPO}.git"
for branch in main v1 v2; do
  git push -u "${URL}" "${branch}"
done
echo "Listo: main, v1, v2 en origin."
