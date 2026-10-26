#!/usr/bin/env bash
# Append one row to a show-me-your-work decision log (TSV).
# Usage: log.sh <logfile> <phase> <decision> <why> <evidence> <result>
set -euo pipefail

if [[ "$#" -ne 6 ]]; then
  printf 'usage: log.sh <logfile> <phase> <decision> <why> <evidence> <result>\n' >&2
  exit 1
fi

logfile="$1"
shift

mkdir -p "$(dirname "$logfile")"

# Use `>>` here, never `>`. A network mount can fail this test for a log
# that exists. Then the cost is one stray header line, not the rows.
if [[ ! -s "$logfile" ]]; then
  printf 'ts\tphase\tdecision\twhy\tevidence\tresult\n' >>"$logfile"
fi

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Reviewers open this log in spreadsheets, and cells can carry generated
# or user-supplied text (PR titles, filenames). A leading =, +, - or @
# would run as a formula, so prefix it with a single quote.
clean() {
  local v
  v="$(printf '%s' "$1" | tr '\t\n\r' '   ')"
  case "$v" in
    =* | +* | -* | @*) printf "'%s" "$v" ;;
    *) printf '%s' "$v" ;;
  esac
}

printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
  "$ts" "$(clean "$1")" "$(clean "$2")" "$(clean "$3")" "$(clean "$4")" "$(clean "$5")" \
  >>"$logfile"

# Adapted from pstack's `show-me-your-work/scripts/log.sh` by Lauren Tan (MIT, https://github.com/cursor/plugins).
