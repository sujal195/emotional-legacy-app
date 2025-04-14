
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
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
