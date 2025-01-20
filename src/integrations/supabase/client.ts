import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wecmvyohaxizmnhuvjly.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY212eW9oYXhpem1uaHV2amx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjU1MzEsImV4cCI6MjA1MTcwMTUzMX0.XsX604t39-TAAotJv9qbSCfNJlVE0u02arYHtrZIgYs";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Initialize session from localStorage if it exists
const initSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error initializing session:', error);
    // Clear any invalid session data
    await supabase.auth.signOut();
    return;
  }
  if (!session) {
    console.log('No session found');
    return;
  }
  console.log('Session initialized successfully');
};

// Call initSession when the client is imported
initSession();