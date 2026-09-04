/**
 * Bug Condition Exploration Test
 * 
 * Property 1: Supabase Client Initialization with SUPABASE_ANON_KEY
 * 
 * Validates: Requirements 1.1, 1.2, 1.3
 * 
 * This test MUST FAIL on unfixed code, confirming the bug exists:
 * - The code checks for process.env.SUPABASE_KEY (undefined)
 * - But .env.local defines SUPABASE_ANON_KEY (defined)
 * - Result: getSupabaseClient() returns null instead of valid client
 * 
 * Counterexample expected on unfixed code:
 * getSupabaseClient() returns null when SUPABASE_ANON_KEY is defined
 * but code checks for SUPABASE_KEY
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSupabaseClient } from '../supabaseClient.js';

describe('Supabase Client Initialization - Bug Condition Exploration', () => {
  // Store original env variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear the module cache to force re-evaluation of environment variables
    // This is important because supabaseClient.js reads env at module load time
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  /**
   * Test Case 1: Client Initialization with SUPABASE_ANON_KEY
   * 
   * Setup: 
   * - SUPABASE_ANON_KEY = 'test-key-123'
   * - SUPABASE_URL = 'https://test.supabase.co'
   * - SUPABASE_KEY = undefined (NOT set)
   * 
   * Expected Behavior (FIXED CODE):
   * - getSupabaseClient() should return a valid client instance (not null)
   * 
   * Bug Behavior (UNFIXED CODE):
   * - getSupabaseClient() returns null because it checks SUPABASE_KEY instead
   */
  it('should initialize Supabase client when SUPABASE_ANON_KEY and SUPABASE_URL are set', async () => {
    // Setup environment: SUPABASE_ANON_KEY defined, SUPABASE_KEY undefined
    process.env.SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_KEY; // Ensure SUPABASE_KEY is NOT defined

    // Import fresh to pick up new env variables
    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    // Call getSupabaseClient
    const client = freshGetSupabaseClient();

    // Assert: Client should NOT be null
    expect(client).not.toBeNull();

    // Assert: Client should be an object (SupabaseClient instance)
    expect(typeof client).toBe('object');

    // Assert: Client should have expected Supabase methods
    expect(typeof client.from).toBe('function');
  });

  /**
   * Test Case 2: Database Operations Without "Not Initialized" Error
   * 
   * Setup: Same as Test Case 1 (SUPABASE_ANON_KEY and SUPABASE_URL defined)
   * 
   * Expected Behavior (FIXED CODE):
   * - Calling getSupabaseClient() returns valid client
   * - Database operations can be called without throwing "not initialized" error
   * 
   * Bug Behavior (UNFIXED CODE):
   * - getSupabaseClient() returns null
   * - Any database operation throws "Supabase client not initialized"
   */
  it('should allow database operations when client is properly initialized', async () => {
    process.env.SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_KEY;

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    const client = freshGetSupabaseClient();

    // The client should be usable without throwing
    expect(() => {
      if (!client) {
        throw new Error('Supabase client not initialized');
      }
      // If we got here, client initialization succeeded
    }).not.toThrow();
  });

  /**
   * Test Case 3: Client Initialization Returns Valid Instance
   * 
   * Verifies that the returned client is actually a SupabaseClient instance
   * (not just any object, but specifically a Supabase client)
   * 
   * Bug Condition: On unfixed code, this returns null, causing this test to fail
   */
  it('should return a valid SupabaseClient instance (not null or undefined)', async () => {
    process.env.SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_KEY;

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    const client = freshGetSupabaseClient();

    // Assert that client is not null, undefined, or falsy
    expect(client).toBeTruthy();

    // Assert that client is a proper object with methods
    expect(client).toHaveProperty('from');
    expect(client).toHaveProperty('auth');
    expect(client).toHaveProperty('realtime');
  });
});
