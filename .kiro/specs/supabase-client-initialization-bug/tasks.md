# Implementation Plan

## Phase 1: Exploratory Tests (Before Fix)

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Supabase Client Initialization with SUPABASE_ANON_KEY
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to concrete failing case: environment where `SUPABASE_ANON_KEY` and `SUPABASE_URL` are defined but `SUPABASE_KEY` is not
  - Test that `getSupabaseClient()` returns a valid Supabase client instance (not null) when `SUPABASE_ANON_KEY` and `SUPABASE_URL` are set
  - Implementation approach:
    - Create test file: `apps/api/src/services/__tests__/supabaseClient.test.js`
    - Set up environment variables: `SUPABASE_ANON_KEY=test-key`, `SUPABASE_URL=https://test.supabase.co`
    - Call `getSupabaseClient()`
    - Assert that returned client is not null
    - Assert that client is an instanceof SupabaseClient
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (confirms bug exists - client returns null)
  - Document counterexamples found: "getSupabaseClient() returns null when SUPABASE_ANON_KEY is defined but code checks SUPABASE_KEY"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

## Phase 2: Preservation Tests (Before Fix)

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Missing Credentials Error Handling
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: When `SUPABASE_URL` or `SUPABASE_ANON_KEY` are missing, `getSupabaseClient()` returns null on unfixed code
  - Observe: Warning message is logged to console when credentials are missing
  - Write property-based tests:
    - Test case 1: When `SUPABASE_URL` is undefined, return null and log warning
    - Test case 2: When `SUPABASE_ANON_KEY` is undefined, return null and log warning
    - Test case 3: When both are undefined, return null and log warning
    - Test case 4: Verify error handling doesn't change - errors from `createClient()` are caught and logged
  - Implementation approach:
    - Create test file: `apps/api/src/services/__tests__/supabaseClient.preservation.test.js`
    - Test 1: Set `SUPABASE_URL=https://test.supabase.co`, unset `SUPABASE_ANON_KEY`, call `getSupabaseClient()`, assert null returned
    - Test 2: Set `SUPABASE_ANON_KEY=test-key`, unset `SUPABASE_URL`, call `getSupabaseClient()`, assert null returned
    - Test 3: Unset both, call `getSupabaseClient()`, assert null returned
    - Test 4: Mock `createClient()` to throw error, verify error is caught and logged
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Phase 3: Implementation

- [ ] 3. Fix Supabase client environment variable reference

  - [ ] 3.1 Implement the fix
    - File: `apps/api/src/services/supabaseClient.js`
    - Change line 17 from `const SUPABASE_KEY = process.env.SUPABASE_KEY;` to `const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;`
    - Add clarifying comment above the lines explaining why `SUPABASE_ANON_KEY` is used
    - Specific change:
      ```javascript
      // Use SUPABASE_ANON_KEY (public/anonymous key) for client operations
      // SUPABASE_KEY (service role key) should only be used on backend for admin operations
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
      ```
    - _Bug_Condition: isBugCondition(env) where env.SUPABASE_KEY is undefined AND env.SUPABASE_ANON_KEY is defined_
    - _Expected_Behavior: expectedBehavior(client) - client should initialize successfully and not be null_
    - _Preservation: Missing credentials should still return null with warning; error handling should remain unchanged_
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Supabase Client Initialization with SUPABASE_ANON_KEY
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1: `npm test -- supabaseClient.test.js`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that `getSupabaseClient()` now returns a valid client instance
    - Verify that database operations no longer throw "not initialized" errors
    - _Requirements: Expected Behavior Properties from design_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Missing Credentials Error Handling
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2: `npm test -- supabaseClient.preservation.test.js`
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preservation tests still pass after fix (no regressions)
    - Verify that missing credentials still return null with warnings
    - Verify that error handling remains intact
    - _Requirements: Preservation Requirements from design_

## Phase 4: Verification

- [ ] 4. Checkpoint - Ensure all tests pass and bug is fixed
  - Run full test suite for supabaseClient: `npm test -- supabaseClient`
  - Verify all unit tests pass (initialization tests + preservation tests)
  - Verify application starts without "credentials not configured" warnings
  - Test a simple database operation end-to-end (e.g., create a test record)
  - Confirm all tests pass, ask the user if questions arise
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

