/**
 * Supabase Client Service
 * Centralized database connection and utilities
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local or .env (try .env.local first)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPathLocal = path.join(__dirname, '../../.env.local');
const envPathDefault = path.join(__dirname, '../../.env');
dotenv.config({ path: envPathLocal });
dotenv.config({ path: envPathDefault });

// Setup WebSocket and fetch polyfills for Node.js
if (typeof global !== 'undefined') {
  global.WebSocket = WebSocket;
  global.fetch = fetch;
}

// Use SUPABASE_ANON_KEY (public/anonymous key) for client operations
// SUPABASE_KEY (service role key) should only be used on backend for admin operations
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
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error.message);
      return null;
    }
  }
  return supabaseClient;
}

/**
 * Build Supabase query with filters
 */
function buildQuery(baseQuery, filter) {
  let query = baseQuery;
  
  if (filter && typeof filter === 'object') {
    for (const [key, value] of Object.entries(filter)) {
      if (value === null || value === undefined) {
        query = query.is(key, null);
      } else if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        // For exact match
        query = query.eq(key, value);
      }
    }
  }
  
  return query;
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
    let baseQuery = client.from(table);
    
    if (operation === 'select') {
      baseQuery = buildQuery(baseQuery.select('*'), filter);
    } else if (operation === 'insert') {
      // IMPORTANTE: Adicionar .select() para retornar os dados inseridos
      baseQuery = baseQuery.insert(data).select();
    } else if (operation === 'update') {
      baseQuery = buildQuery(baseQuery, filter).update(data).select();
    } else if (operation === 'delete') {
      baseQuery = buildQuery(baseQuery, filter).delete();
    }

    const result = await baseQuery;
    
    if (result.error) {
      console.error(`❌ Database ${operation} error on ${table}:`, {
        message: result.error.message,
        code: result.error.code,
        hint: result.error.hint,
        details: result.error.details,
        status: result.status,
      });
      throw result.error;
    }

    return result.data;
  } catch (error) {
    console.error(`❌ Database ${operation} failed on ${table}:`, error.message);
    throw error;
  }
}

/**
 * Insert helper
 */
export async function insert(table, data) {
  console.log(`🔧 Inserting into ${table}:`, data);
  const result = await query(table, 'insert', data);
  console.log(`✅ Insert result:`, result);
  return result;
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

    if (filter && typeof filter === 'object') {
      for (const [key, value] of Object.entries(filter)) {
        if (value === null || value === undefined) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    return result.count;
  } catch (error) {
    console.error(`Count failed on ${table}:`, error.message);
    throw error;
  }
}

export default { getSupabaseClient, query, insert, select, update, remove, count };
