#!/bin/bash

# PetAdopt - Clean Up Test Artifacts Script
# Remove Playwright test videos and reports to save disk space

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧹 PetAdopt - Cleaning up test artifacts..."
echo ""

# Define paths
WEB_DIR="$PROJECT_ROOT/apps/web"
TEST_RESULTS_DIR="$WEB_DIR/test-results"
PLAYWRIGHT_REPORT_DIR="$WEB_DIR/playwright-report"

# Function to calculate size
get_size() {
  if [ -d "$1" ]; then
    du -sh "$1" | cut -f1
  else
    echo "0B"
  fi
}

# Collect initial sizes
INITIAL_TEST_RESULTS_SIZE=$(get_size "$TEST_RESULTS_DIR")
INITIAL_REPORT_SIZE=$(get_size "$PLAYWRIGHT_REPORT_DIR")

echo "📊 Current sizes:"
echo "  - test-results: $INITIAL_TEST_RESULTS_SIZE"
echo "  - playwright-report: $INITIAL_REPORT_SIZE"
echo ""

# Remove directories
if [ -d "$TEST_RESULTS_DIR" ]; then
  echo "🗑️  Removing $TEST_RESULTS_DIR..."
  rm -rf "$TEST_RESULTS_DIR"
  echo "   ✅ Removed"
fi

if [ -d "$PLAYWRIGHT_REPORT_DIR" ]; then
  echo "🗑️  Removing $PLAYWRIGHT_REPORT_DIR..."
  rm -rf "$PLAYWRIGHT_REPORT_DIR"
  echo "   ✅ Removed"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📝 Note: These directories are now in .gitignore and will be auto-generated"
echo "   during test runs. Use 'npm run test:e2e' to regenerate if needed."
