#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DEPLOY_HOST="${DEPLOY_HOST:-120.48.47.164}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/usr/share/nginx/knowledge-platform}"

if [[ -z "$DEPLOY_PATH" || "$DEPLOY_PATH" == "/" ]]; then
  echo "DEPLOY_PATH is unsafe: '$DEPLOY_PATH'" >&2
  exit 1
fi

if [[ "${ALLOW_UNSAFE_DEPLOY_PATH:-}" != "1" && "$DEPLOY_PATH" != "/usr/share/nginx/knowledge-platform" ]]; then
  echo "Refusing to deploy to unexpected DEPLOY_PATH: '$DEPLOY_PATH' (set ALLOW_UNSAFE_DEPLOY_PATH=1 to override)" >&2
  exit 1
fi

SSH_IDENTITY_ARGS=()
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_IDENTITY_ARGS=(-i "$DEPLOY_SSH_KEY")
fi

DEPLOY_BATCH_MODE="${DEPLOY_BATCH_MODE:-no}"
SSH_BASE_ARGS=(-p "$DEPLOY_PORT" -o BatchMode="$DEPLOY_BATCH_MODE" -o StrictHostKeyChecking=accept-new)
SCP_BASE_ARGS=(-P "$DEPLOY_PORT" -o BatchMode="$DEPLOY_BATCH_MODE" -o StrictHostKeyChecking=accept-new)

echo "Building web bundle..."
npm run build

if [[ ! -d "dist" ]]; then
  echo "Missing dist/ after build" >&2
  exit 1
fi

ARCHIVE_NAME="dist-$(date +%Y%m%d%H%M%S).tar.gz"
LOCAL_ARCHIVE_PATH="$ROOT_DIR/$ARCHIVE_NAME"
REMOTE_ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

cleanup() {
  rm -f "$LOCAL_ARCHIVE_PATH"
}
trap cleanup EXIT

rm -f "$LOCAL_ARCHIVE_PATH"
tar -C "$ROOT_DIR/dist" -czf "$LOCAL_ARCHIVE_PATH" .

echo "Uploading $ARCHIVE_NAME to ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_ARCHIVE_PATH} ..."
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  scp "${SCP_BASE_ARGS[@]}" "${SSH_IDENTITY_ARGS[@]}" "$LOCAL_ARCHIVE_PATH" "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_ARCHIVE_PATH}"
else
  scp "${SCP_BASE_ARGS[@]}" "$LOCAL_ARCHIVE_PATH" "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_ARCHIVE_PATH}"
fi

echo "Deploying to $DEPLOY_PATH and restarting nginx..."
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  ssh "${SSH_BASE_ARGS[@]}" "${SSH_IDENTITY_ARGS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "set -euo pipefail
sudo mkdir -p '$DEPLOY_PATH'
sudo find '$DEPLOY_PATH' -mindepth 1 -maxdepth 1 -exec rm -rf {} +
sudo tar -C '$DEPLOY_PATH' -xzf '$REMOTE_ARCHIVE_PATH'
rm -f '$REMOTE_ARCHIVE_PATH'
sudo systemctl restart nginx 2>/dev/null || sudo service nginx restart 2>/dev/null || sudo nginx -s reload 2>/dev/null"
else
  ssh "${SSH_BASE_ARGS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "set -euo pipefail
sudo mkdir -p '$DEPLOY_PATH'
sudo find '$DEPLOY_PATH' -mindepth 1 -maxdepth 1 -exec rm -rf {} +
sudo tar -C '$DEPLOY_PATH' -xzf '$REMOTE_ARCHIVE_PATH'
rm -f '$REMOTE_ARCHIVE_PATH'
sudo systemctl restart nginx 2>/dev/null || sudo service nginx restart 2>/dev/null || sudo nginx -s reload 2>/dev/null"
fi

echo "Done."
