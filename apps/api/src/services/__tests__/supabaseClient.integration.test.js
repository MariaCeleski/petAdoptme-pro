/**
 * Integration Tests for Supabase Client
 * 
 * Verifies that the Supabase client initialization works correctly
 * with properly configured environment variables
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Supabase Client Integration', () => {
  beforeEach(() => {
    // Ensure we have proper environment for testing
    vi.resetModules();
  });

  /**
   * Test: Client initializes with proper credentials
   * 
   * This test verifies that when proper credentials are available,
   * the client initializes successfully
   */
  it('should successfully initialize client when credentials are properly configured', async () => {
    // Set up proper environment variables
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://qmzfpgewfmzkghaytzrw.supabase.co';
    process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtemZwZ2V3Zm16a2doYXl0enJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODkzMzksImV4cCI6MjEwMzc2NTMzOX0.5y1Cr1XUqqTEa-8aj6jBayuNRaQkJ0M3Zos3mUrMYYE';

    const { getSupabaseClient } = await import('../supabaseClient.js');

    const client = getSupabaseClient();

    // Assert: Client should be initialized
    expect(client).not.toBeNull();
    expect(typeof client).toBe('object');

    // Assert: Client should have required methods
    expect(typeof client.from).toBe('function');
    expect(typeof client.auth).toBe('object');
  });

  /**
   * Test: Default export provides all functions
   * 
   * Verifies that the default export provides all database helper functions
   */
  it('should export all database helper functions', async () => {
    const supabaseModule = await import('../supabaseClient.js');

    // Assert: Named exports should exist
    expect(typeof supabaseModule.getSupabaseClient).toBe('function');
    expect(typeof supabaseModule.query).toBe('function');
    expect(typeof supabaseModule.insert).toBe('function');
    expect(typeof supabaseModule.select).toBe('function');
    expect(typeof supabaseModule.update).toBe('function');
    expect(typeof supabaseModule.remove).toBe('function');
    expect(typeof supabaseModule.count).toBe('function');

    // Assert: Default export should have these methods
    const defaultExport = supabaseModule.default;
    expect(defaultExport.getSupabaseClient).toBe(supabaseModule.getSupabaseClient);
    expect(defaultExport.query).toBe(supabaseModule.query);
    expect(defaultExport.insert).toBe(supabaseModule.insert);
  });

  /**
   * Test: Verify correct environment variable is being used
   * 
   * This test ensures that the code is checking for SUPABASE_ANON_KEY,
   * not SUPABASE_KEY, confirming the bug fix
   */
  it('should correctly identify when SUPABASE_ANON_KEY is present but SUPABASE_KEY is not', async () => {
    // Set up the exact condition from the bug: SUPABASE_ANON_KEY defined, SUPABASE_KEY not
    delete process.env.SUPABASE_KEY;
    process.env.SUPABASE_ANON_KEY = 'test-key-123';
    process.env.SUPABASE_URL = 'https://test.supabase.co';

    const { getSupabaseClient: freshGetSupabaseClient } = await import('../supabaseClient.js');

    const client = freshGetSupabaseClient();

    // Assert: Client should be initialized (confirming the fix)
    expect(client).not.toBeNull();
    expect(typeof client).toBe('object');
  });
});
