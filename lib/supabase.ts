import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be in environment variables (import.meta.env.VITE_...)
// For this generated example, we check if they exist. If not, the service layer will fall back to mock data.

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = !!supabase;