#!/usr/bin/env bash
# Claude Code PreToolUse hook — blocks git commits that include .env files or secrets
# Exit 2 to block; exit 0 to allow

# Only run on Bash tool calls that look like git commits
COMMAND=$(cat /dev/stdin | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null)

# Only act on git commit commands
if ! echo "$COMMAND" | grep -qE '^git commit'; then
  exit 0
fi

ERRORS=()

# ── 1. Block .env files ───────────────────────────────────────────────────────
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null)

while IFS= read -r file; do
  # Match .env, .env.production, .env.development, etc. — but allow .env.local.example
  if echo "$file" | grep -qE '(^|/)\.env(\.[^/]+)?$' && ! echo "$file" | grep -q '\.example$'; then
    ERRORS+=("Blocked: staged file '$file' looks like an env file")
  fi
done <<< "$STAGED_FILES"

# ── 2. Scan staged content for secrets ───────────────────────────────────────
STAGED_DIFF=$(git diff --cached 2>/dev/null)

# Helper: check for a pattern and report which file+line it was found on
check_pattern() {
  local label="$1"
  local pattern="$2"
  local matches
  matches=$(git diff --cached -U0 2>/dev/null | grep -n "^+" | grep -E "$pattern" | grep -v "^+++" | head -5)
  if [[ -n "$matches" ]]; then
    ERRORS+=("Blocked: possible $label detected in staged changes")
  fi
}

# Generic high-entropy secret assignments (VAR=<long-value> or VAR: <long-value>)
check_pattern "secret assignment" '(TOKEN|SECRET|PASSWORD|API_KEY|AUTH_TOKEN|PRIVATE_KEY|ACCESS_KEY|COOKIE)[[:space:]]*[=:][[:space:]]*["\x27]?.{20,}'

# Project-specific env var names
check_pattern "TURSO_AUTH_TOKEN" 'TURSO_AUTH_TOKEN[[:space:]]*[=:]'
check_pattern "OPENROUTER_API_KEY" 'OPENROUTER_API_KEY[[:space:]]*[=:]'
check_pattern "KINDLE_COOKIES" 'KINDLE_COOKIES[[:space:]]*[=:]'

# AWS keys
check_pattern "AWS access key" 'AKIA[0-9A-Z]{16}'
check_pattern "AWS secret key" 'aws_secret_access_key[[:space:]]*[=:]'

# Common token prefixes
check_pattern "GitHub token" 'ghp_[0-9A-Za-z]{36}'
check_pattern "OpenAI key"   'sk-[0-9A-Za-z]{32,}'
check_pattern "PEM private key" '\-\-\-\-\-BEGIN (RSA |EC )?PRIVATE KEY'

# ── 3. Report and block if issues found ──────────────────────────────────────
if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo "Security check failed — commit blocked:"
  for err in "${ERRORS[@]}"; do
    echo "  • $err"
  done
  exit 2
fi

exit 0
