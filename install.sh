#!/usr/bin/env bash
set -euo pipefail

REPO="planetarium/v8-cli"
INSTALL_DIR="${V8_CLI_HOME:-$HOME/v8-cli}"
SKILL_DIR="$HOME/.claude/skills/v8-admin"

# Check prerequisites
for cmd in node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required but not installed." >&2
    exit 1
  fi
done

echo "Installing v8-cli to $INSTALL_DIR ..."
mkdir -p "$INSTALL_DIR"

# Download latest release tarball
TMPFILE="$(mktemp)"
if command -v gh &>/dev/null; then
  gh release download --repo "$REPO" --pattern "*.tgz" --output "$TMPFILE" --clobber
elif [ -n "${GH_TOKEN:-}" ]; then
  TAG=$(curl -sH "Authorization: token $GH_TOKEN" "https://api.github.com/repos/$REPO/releases/latest" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).tag_name))")
  curl -sfL -H "Authorization: token $GH_TOKEN" -H "Accept: application/octet-stream" \
    "https://api.github.com/repos/$REPO/releases/tags/$TAG/assets" -o "$TMPFILE" 2>/dev/null \
    || curl -sfL "https://github.com/$REPO/releases/download/$TAG/v8-cli-${TAG#v}.tgz" -o "$TMPFILE"
else
  TAG=$(curl -sf "https://api.github.com/repos/$REPO/releases/latest" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).tag_name))")
  curl -sfL "https://github.com/$REPO/releases/download/$TAG/v8-cli-${TAG#v}.tgz" -o "$TMPFILE"
fi

# Extract (npm pack tarballs have a package/ prefix)
tar xzf "$TMPFILE" -C "$INSTALL_DIR" --strip-components=1
rm -f "$TMPFILE"

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
