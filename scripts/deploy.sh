#!/usr/bin/env bash
# Build, test and upload the static site to the web server root.
#
# Without --delete on purpose: old image variants stay on the server so cached
# HTML keeps working during rollouts (see README, "Photography"). Remove retired
# galleries on the server by hand.
#
# Usage: npm run deploy
#   DEPLOY_HOST and DEPLOY_DIR override the target.
set -euo pipefail

HOST=${DEPLOY_HOST:-hafen}
REMOTE_DIR=${DEPLOY_DIR:-/srv/nibraun.de}

# The key lives in the systemd user ssh-agent; shells without SSH_AUTH_SOCK would not find it.
export SSH_AUTH_SOCK=${SSH_AUTH_SOCK:-$XDG_RUNTIME_DIR/ssh-agent.socket}

cd "$(dirname "$0")/.."

if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$HOST" true 2>/dev/null; then
    echo "No SSH connection to $HOST (agent: $SSH_AUTH_SOCK)." >&2
    echo "Load the key: SSH_AUTH_SOCK=$XDG_RUNTIME_DIR/ssh-agent.socket ssh-add ~/.ssh/ed25519-ithaka-host" >&2
    echo "If SSH_AUTH_SOCK points to another agent, run: SSH_AUTH_SOCK=$XDG_RUNTIME_DIR/ssh-agent.socket npm run deploy" >&2
    exit 1
fi

echo "==> Build"
npm run build
npm test

echo "==> Upload to $HOST:$REMOTE_DIR"
ssh "$HOST" "mkdir -p '$REMOTE_DIR'"
# Caddy reads the files as its own user, so they must be world-readable.
rsync -azR --chmod=D755,F644 --no-owner --no-group \
    index.html 404.html work/ photos/ imprint/ privacy/ de/ \
    dist/tailwind.css fonts/ img/ robots.txt sitemap.xml llms.txt \
    "$HOST:$REMOTE_DIR/"

echo "==> Done"
