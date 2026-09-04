# Test Artifacts Management

## Overview

This document explains how test artifacts (videos and reports from Playwright E2E tests) are managed in the PetAdopt project.

## What Are Test Artifacts?

When running E2E tests with Playwright, the following directories are created:

- **`apps/web/test-results/`** - Stores individual test videos for failed tests (generates ~50-60MB)
- **`apps/web/playwright-report/`** - Stores the HTML report and video data (generates ~40-50MB)

**Total**: ~96-110MB per full test run

## Why Delete Them?

1. **Not needed in production** - Videos are only useful during development/debugging
2. **Large file sizes** - Each test video is 1-5MB, quickly accumulating hundreds of MB
3. **Should not be committed** - Stored in `.gitignore` to keep repository lean
4. **Auto-regenerated** - Can be recreated anytime by running tests again

## When to Delete

### Option 1: Manual Cleanup

Run the cleanup script:

```bash
./scripts/cleanup-test-artifacts.sh
```

### Option 2: Automatic Cleanup (CI/CD)

The GitHub Actions workflow automatically cleans up artifacts:
- Runs on every push to `main` or `develop`
- Runs weekly on Monday mornings
- File: `.github/workflows/cleanup-test-artifacts.yml`

### Option 3: Add to Your Workflow

Add to your npm scripts in `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:clean": "rm -rf apps/web/test-results apps/web/playwright-report && npm run test:e2e",
    "clean:artifacts": "node scripts/cleanup-test-artifacts.sh"
  }
}
```

Then run:

```bash
npm run test:e2e:clean
```

## Status in PetAdopt

✅ **Done:**
- Added `playwright-report/`, `test-results/`, `.playwright/` to `.gitignore`
- Deleted 96MB of test artifacts locally
- Created cleanup script at `scripts/cleanup-test-artifacts.sh`
- Created GitHub Actions workflow for automatic cleanup

## Viewing Test Results

If you need to view test results:

1. Run: `npm run test:e2e`
2. View report: `npx playwright show-report`
3. Clean up after: `./scripts/cleanup-test-artifacts.sh`

## References

- [Playwright Documentation - Test Reports](https://playwright.dev/docs/test-reporters)
- [GitHub Actions - Artifact Management](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
