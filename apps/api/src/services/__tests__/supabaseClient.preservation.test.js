/**
 * Preservation Property Tests
 * 
 * Property 2: Missing Credentials Error Handling
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 * 
 * These tests verify that error handling for missing credentials
 * remains unchanged before and after the fix.
 * 
 * All tests should PASS on both fixed and unfixed code,
 * confirming that error handling is preserved.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Supabase Client - Preservation Tests (Missing Credentials Handling)', () => {
  const originalEnv = process.env;
  const originalWarn = console.warn;
  let warnMessages = [];

  beforeEach(() => {
    // Clear warn messages for each test
    warnMessages = [];
    
    // Mock console.warn to capture warning messages
    console.warn = vi.fn((...args) => {
      warnMessages.push(args.join(' '));
    });

    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.warn = originalWarn;
  });

  /**
   * Test Case 1: Missing SUPABASE_URL
   * 
   * Setup:
   * - SUPABASE_URL = undefined
   * - SUPABASE_ANON_KEY = 'test-key'
   * 
   * Expected Behavior (both fixed and unfixed code):
   * - getSupabaseClient() should return null
   * - Warning message should be logged
   */
  it('should return null and log warning when SUPABASE_URL is missing', async () => {
    process.env.SUPABASE_ANON_KEY = 'test-key-123';
    delete process.env.SUPABASE_URL;

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    const client = freshGetSupabaseClient();

    // Assert: Client should be null when URL is missing
    expect(client).toBeNull();

    // Assert: Warning should have been logged
    expect(warnMessages.length).toBeGreaterThan(0);
    expect(warnMessages[0]).toContain('Supabase credentials not configured');
  });

  /**
   * Test Case 2: Missing SUPABASE_ANON_KEY
   * 
   * Setup:
   * - SUPABASE_URL = 'https://test.supabase.co'
   * - SUPABASE_ANON_KEY = undefined
   * 
   * Expected Behavior (both fixed and unfixed code):
   * - getSupabaseClient() should return null
   * - Warning message should be logged
   */
  it('should return null and log warning when SUPABASE_ANON_KEY is missing', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_ANON_KEY;

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    const client = freshGetSupabaseClient();

    // Assert: Client should be null when ANON_KEY is missing
    expect(client).toBeNull();

    // Assert: Warning should have been logged
    expect(warnMessages.length).toBeGreaterThan(0);
    expect(warnMessages[0]).toContain('Supabase credentials not configured');
  });

  /**
   * Test Case 3: Both SUPABASE_URL and SUPABASE_ANON_KEY Missing
   * 
   * Setup:
   * - SUPABASE_URL = undefined
   * - SUPABASE_ANON_KEY = undefined
   * 
   * Expected Behavior (both fixed and unfixed code):
   * - getSupabaseClient() should return null
   * - Warning message should be logged
   */
  it('should return null and log warning when both SUPABASE_URL and SUPABASE_ANON_KEY are missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    const client = freshGetSupabaseClient();

    // Assert: Client should be null when both are missing
    expect(client).toBeNull();

    // Assert: Warning should have been logged
    expect(warnMessages.length).toBeGreaterThan(0);
    expect(warnMessages[0]).toContain('Supabase credentials not configured');
  });

  /**
   * Test Case 4: Database Query Throws Error When Client Not Initialized
   * 
   * Setup:
   * - Missing credentials so client returns null
   * 
   * Expected Behavior (both fixed and unfixed code):
   * - Calling query() should throw "Supabase client not initialized" error
   * - Error handling should remain intact
   */
  it('should throw "Supabase client not initialized" error when calling query() with missing credentials', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { query } = await import('../supabaseClient.js');

    // Assert: query() should throw appropriate error
    await expect(async () => {
      await query('pets', 'select');
    }).rejects.toThrow('Supabase client not initialized');
  });

  /**
   * Test Case 5: All Database Helper Functions Throw Error When Client Not Initialized
   * 
   * Verifies that error handling is consistent across all database helper functions:
   * insert, select, update, remove, count
   */
  it('should throw error when calling insert() with missing credentials', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { insert } = await import('../supabaseClient.js');

    await expect(async () => {
      await insert('pets', { name: 'Fluffy' });
    }).rejects.toThrow('Supabase client not initialized');
  });

  it('should throw error when calling select() with missing credentials', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { select } = await import('../supabaseClient.js');

    await expect(async () => {
      await select('pets');
    }).rejects.toThrow('Supabase client not initialized');
  });

  it('should throw error when calling update() with missing credentials', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { update } = await import('../supabaseClient.js');

    await expect(async () => {
      await update('pets', { name: 'Fluffy' }, { id: 1 });
    }).rejects.toThrow('Supabase client not initialized');
  });

  it('should throw error when calling remove() with missing credentials', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { remove } = await import('../supabaseClient.js');

    await expect(async () => {
      await remove('pets', { id: 1 });
    }).rejects.toThrow('Supabase client not initialized');
  });

  it('should throw error when calling count() with missing credentials', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { count } = await import('../supabaseClient.js');

    await expect(async () => {
      await count('pets');
    }).rejects.toThrow('Supabase client not initialized');
  });

  /**
   * Test Case 6: Verify Warning Message Content
   * 
   * Verifies that the warning message provides helpful information
   * about missing credentials
   */
  it('should provide helpful warning message when credentials are missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    freshGetSupabaseClient();

    // Assert: Warning message should be present and helpful
    expect(warnMessages.length).toBeGreaterThan(0);
    const warning = warnMessages[0];
    expect(warning).toContain('credentials');
    expect(warning).toContain('not configured');
  });
});
