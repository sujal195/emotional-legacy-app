
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from the project's actual Supabase instance
const supabaseUrl = 'https://spweeempthmwxplxumvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwd2VlZW1wdGhtd3hwbHh1bXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTc4NzAsImV4cCI6MjA2MDIzMzg3MH0.PJ6Xq3nlDjoOZHxogbJrDD_N_7sZH_P0x4JYeTytgUo';

// Create and export the Supabase client with proper auth configuration
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'memoria-auth-storage',
      storage: localStorage,
      detectSessionInUrl: true, // Detect OAuth session in the URL
      debug: true // Re-enable debug mode to help troubleshoot
    }
  }
);

// Types for database tables
export type User = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  avatar_url?: string;
}

export type Memory = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string; // The date the memory occurred
  created_at: string;
  emotion?: string;
  location?: string;
  is_private: boolean;
  image_url?: string;
}

export type UserActivity = {
  id: string;
  user_id: string;
  activity_type: 'signin' | 'signout';
  timestamp: string;
  created_at: string;
}
