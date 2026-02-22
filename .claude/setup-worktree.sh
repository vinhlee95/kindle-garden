#!/usr/bin/env bash
# Sets up a Claude Code worktree to share node_modules, data, and .env.local
# from the main repo so you can start dev immediately without reinstalling.
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

echo ""
echo "Done. Run 'pnpm dev' inside the worktree to start."
