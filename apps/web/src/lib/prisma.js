/**
 * Supabase Client (Frontend)
 * 
 * Note: Prisma is a backend-only ORM. The frontend uses Supabase client directly.
 * This file provides a proxy interface to Supabase for gradual migration.
 * 
 * ALL database operations should go through:
 * - Backend API routes (preferred)
 * - Or Supabase client directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Mock Prisma client that redirects to backend API
 * This is a compatibility layer for the existing codebase
 */
export const prisma = {
  // User operations
  user: {
    findUnique: async (query) => {
      const res = await fetch('/api/users/profile', {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok ? res.json() : null;
    },
  },

  // Pet operations
  pet: {
    findMany: async (query) => {
      const res = await fetch('/api/pets');
      return res.ok ? res.json() : [];
    },
    findUnique: async (query) => {
      const { where } = query;
      const res = await fetch(`/api/pets/${where.id}`);
      return res.ok ? res.json() : null;
    },
    create: async (data) => {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok ? res.json() : null;
    },
  },

  // Adoption operations
  adoption: {
    findMany: async (query) => {
      const res = await fetch('/api/adoptions');
      return res.ok ? res.json() : [];
    },
    findUnique: async (query) => {
      const { where } = query;
      const res = await fetch(`/api/adoptions/${where.id}`);
      return res.ok ? res.json() : null;
    },
  },

  // Shelter operations
  shelter: {
    findMany: async (query) => {
      const res = await fetch('/api/shelters');
      return res.ok ? res.json() : [];
    },
    findUnique: async (query) => {
      const { where } = query;
      const res = await fetch(`/api/shelters/${where.id}`);
      return res.ok ? res.json() : null;
    },
  },
};

export default prisma;
