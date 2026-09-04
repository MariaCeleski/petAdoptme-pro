# Supabase Client Initialization Bug - Bugfix Requirements

## Introduction

The PetAdopt application is failing to initialize the Supabase client, causing all API calls to fail with "Supabase client not initialized" error. This bug prevents the frontend from communicating with the API, which in turn prevents database operations on the backend. The root cause is a mismatch between the environment variable name being checked in `supabaseClient.js` and the actual environment variable name defined in `.env.local`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the API server starts and `getSupabaseClient()` is called THEN the system checks for `SUPABASE_KEY` variable instead of `SUPABASE_ANON_KEY`, causing the client to remain uninitialized

1.2 WHEN `getSupabaseClient()` is called and SUPABASE_KEY is undefined THEN the system returns null instead of a valid Supabase client

1.3 WHEN any controller tries to use `query()`, `insert()`, `select()`, `update()`, or `remove()` functions and the client is null THEN the system throws "Supabase client not initialized" error, blocking all database operations

1.4 WHEN the frontend makes an API request through `useApi.js` and the backend controller fails THEN the frontend receives the error and displays it to the user, preventing the application from functioning

### Expected Behavior (Correct)

2.1 WHEN the API server starts and `getSupabaseClient()` is called THEN the system correctly checks for `SUPABASE_ANON_KEY` environment variable (which is properly defined in `.env.local`)

2.2 WHEN `SUPABASE_ANON_KEY` and `SUPABASE_URL` are both defined in environment variables THEN the system SHALL successfully initialize the Supabase client and return a valid client instance

2.3 WHEN the Supabase client is properly initialized THEN database operations like `query()`, `insert()`, `select()`, `update()`, and `remove()` SHALL execute successfully without throwing initialization errors

2.4 WHEN the frontend makes an API request through `useApi.js` THEN the backend controller SHALL successfully execute database operations through the initialized Supabase client and return the requested data

### Unchanged Behavior (Regression Prevention)

3.1 WHEN environment variables are missing or invalid THEN the system SHALL CONTINUE TO log a warning message about unconfigured Supabase credentials (current behavior should be preserved)

3.2 WHEN Supabase client initialization fails due to a genuine error (not variable name mismatch) THEN the system SHALL CONTINUE TO catch and log the error appropriately (error handling should remain intact)

3.3 WHEN database operations are successful and the client is initialized THEN the system SHALL CONTINUE TO return results without introducing new error handling paths

3.4 WHEN the application's error handling mechanisms are in place THEN the system SHALL CONTINUE TO throw appropriate errors for actual database failures (not initialization failures)
