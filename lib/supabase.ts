import { createClient } from '@supabase/supabase-js';

// Your Supabase Configuration
const supabaseUrl = 'https://ytknnqcaoamgrqgruykh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a25ucWNhb2FtZ3JxZ3J1eWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTcxOTksImV4cCI6MjA3OTMzMzE5OX0.skr9Czydwqim_yJuDXuejL_zcV8mYq3vslBcy437zTI';

// Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Flag to tell the service layer to use Real Data instead of Mock Data
export const isSupabaseConfigured = true;