import { createClient } from '@supabase/supabase-js';
import { supabase as integrationsClient } from '@/integrations/supabase/client';

// Use the client from the integrations folder, which will be generated
export const supabase = integrationsClient;

// Types for database tables
export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  email_notifications: boolean;
  is_private: boolean;
}

export type UserActivity = {
  id: string;
  user_id: string;
  activity_type: string;
  timestamp: string;
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
