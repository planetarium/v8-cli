#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${V8_CLI_HOME:-$HOME/v8-cli}"
SKILL_DIR="$HOME/.claude/skills/v8-admin"

# Check prerequisites
for cmd in git node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required but not installed." >&2
    exit 1
  fi
done

echo "Installing v8-cli to $INSTALL_DIR ..."

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
  cd "$INSTALL_DIR" && git pull --ff-only
else
  rm -rf "$INSTALL_DIR"
  git clone https://github.com/planetarium/v8-cli.git "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
npm install --production
npm link

# Symlink skill
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
