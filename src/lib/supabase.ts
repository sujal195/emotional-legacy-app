
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables set by Lovable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check and provide feedback if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set. Please make sure you have connected your project to Supabase correctly.');
}

// Create and export the Supabase client with proper auth configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', // Fallback URL to prevent runtime error
  supabaseAnonKey || 'placeholder-key', // Fallback key to prevent runtime error
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'memoria-auth-storage',
      storage: localStorage,
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
