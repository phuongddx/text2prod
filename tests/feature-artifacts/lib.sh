#!/usr/bin/env bash
# shellcheck shell=bash
# Shared assertions for the feature-artifacts static tests. Source it; do not run it.

FAILURES=0

check() {
  if grep -Fq -- "$3" "$2" 2>/dev/null; then
    echo "  [PASS] $1"
  else
    echo "  [FAIL] $1"
    echo "    expected in $2: $3"
    FAILURES=$((FAILURES + 1))
  fi
}

check_absent() {
  if grep -Fq -- "$3" "$2" 2>/dev/null; then
    echo "  [FAIL] $1"
    echo "    unexpected in $2: $3"
    FAILURES=$((FAILURES + 1))
  else
    echo "  [PASS] $1"
  fi
}

finish() {
  if [ "$FAILURES" -gt 0 ]; then
    echo "$1: FAILED ($FAILURES)"
    exit 1
  fi
  echo "$1: all checks passed"
}
