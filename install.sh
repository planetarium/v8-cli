#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${V8_CLI_HOME:-$HOME/v8-cli}"
SKILL_DIR="$HOME/.claude/skills/v8-admin"

for cmd in node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required but not installed." >&2
    exit 1
  fi
done

echo "Installing v8-cli to $INSTALL_DIR ..."
mkdir -p "$INSTALL_DIR"

TAG=$(curl -sf https://api.github.com/repos/planetarium/v8-cli/releases/latest | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).tag_name))")
curl -sfL "https://github.com/planetarium/v8-cli/releases/download/$TAG/v8-cli-${TAG#v}.tgz" -o /tmp/v8-cli.tgz
tar xzf /tmp/v8-cli.tgz -C "$INSTALL_DIR" --strip-components=1
rm -f /tmp/v8-cli.tgz

cd "$INSTALL_DIR"
npm install --production
npm link

if [ -d "$HOME/.claude/skills" ]; then
  rm -rf "$SKILL_DIR"
  ln -s "$INSTALL_DIR/skill" "$SKILL_DIR"
  echo "Skill linked: $SKILL_DIR -> $INSTALL_DIR/skill"
fi

echo ""
echo "Done! Run 'v8 --version' to verify."
echo ""
echo "Quick setup:"
echo "  v8 config set-env local      # or test"
echo "  v8 config set-token <jwt>"
