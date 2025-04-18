
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
      detectSessionInUrl: true,
      debug: true
    }
  }
);

// Types for database tables
export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type Memory = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string;
  emotion: string | null;
  location: string | null;
  is_private: boolean;
  image_url: string | null;
  created_at: string;
}

export type MemoryLike = {
  id: string;
  user_id: string;
  memory_id: string;
  created_at: string;
}

export type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
