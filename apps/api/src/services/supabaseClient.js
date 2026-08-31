/**
 * Supabase Client Service
 * Centralized database connection and utilities
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️  Supabase credentials not configured. Database operations will fail.');
}

/**
 * Create and initialize Supabase client
 */
let supabaseClient = null;

export function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

/**
 * Database query helper
 * Provides consistent error handling for queries
 */
export async function query(table, operation = 'select', data = null, filter = null) {
  const client = getSupabaseClient();
  
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  try {
    let query = client.from(table)[operation];

    // Apply data for insert/update operations
    if (data && (operation === 'insert' || operation === 'update')) {
      query = query(data);
    }

    // Apply filters
    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const { data: result, error } = await query;

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Database ${operation} failed on ${table}:`, error);
    throw error;
  }
}

/**
 * Insert helper
 */
export async function insert(table, data) {
  return query(table, 'insert', data);
}

/**
 * Select helper
 */
export async function select(table, filter = null) {
  return query(table, 'select', null, filter);
}

/**
 * Update helper
 */
export async function update(table, data, filter) {
  return query(table, 'update', data, filter);
}

/**
 * Delete helper
 */
export async function remove(table, filter) {
  return query(table, 'delete', null, filter);
}

/**
 * Count records
 */
export async function count(table, filter = null) {
  const client = getSupabaseClient();
  
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  try {
    let query = client.from(table).select('*', { count: 'exact', head: true });

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const { count: result, error } = await query;

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Count failed on ${table}:`, error);
    throw error;
  }
}

export default { getSupabaseClient, query, insert, select, update, remove, count };
