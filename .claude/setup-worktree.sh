#!/usr/bin/env bash
# Sets up a Claude Code worktree to share node_modules, data, and .env.local
# from the main repo so you can start dev immediately without reinstalling.
# Also creates a worktree-specific .claude/launch.json on the next free port >= 3001.
#
# Usage (from the worktree directory):
#   bash ../../.claude/setup-worktree.sh
#
# Or from repo root, pass the worktree path:
#   bash .claude/setup-worktree.sh .claude/worktrees/my-branch

set -e

MAIN_REPO="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE="${1:-$PWD}"

# Resolve to absolute path
WORKTREE="$(cd "$WORKTREE" && pwd)"

echo "Main repo : $MAIN_REPO"
echo "Worktree  : $WORKTREE"
echo ""

link() {
  local target="$MAIN_REPO/$1"
  local link="$WORKTREE/$1"

  if [ ! -e "$target" ]; then
    echo "  skip  $1  (not found in main repo)"
    return
  fi

  if [ -L "$link" ]; then
    echo "  ok    $1  (already symlinked)"
  elif [ -e "$link" ]; then
    echo "  skip  $1  (exists as real file/dir — remove it first to symlink)"
  else
    ln -s "$target" "$link"
    echo "  link  $1"
  fi
}

link node_modules
link data
link .env.local

# Create a worktree-specific launch.json on the next free port >= 3001
# so it never collides with the main dev server (port 3000) or other worktrees.
mkdir -p "$WORKTREE/.claude"
LAUNCH="$WORKTREE/.claude/launch.json"
if [ -e "$LAUNCH" ]; then
  echo "  ok    .claude/launch.json  (already exists)"
else
  PORT=3001
  while lsof -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT + 1))
  done
  cat > "$LAUNCH" <<JSON
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "dev",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev", "--port", "$PORT"],
      "port": $PORT
    }
  ]
}
JSON
  echo "  write .claude/launch.json  (port $PORT)"
fi

echo ""
echo "Done. Run 'pnpm dev' inside the worktree to start."
