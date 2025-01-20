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
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce',
      debug: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);

// Initialize session from localStorage if it exists
const initSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error initializing session:', error);
      await supabase.auth.signOut();
      return;
    }
    
    if (session) {
      console.log('Session initialized successfully');
      // Verify the session is still valid
      const { data: { user }, error: refreshError } = await supabase.auth.getUser();
      if (refreshError || !user) {
        console.error('Session invalid, signing out:', refreshError);
        await supabase.auth.signOut();
      }
    } else {
      console.log('No session found');
    }
  } catch (err) {
    console.error('Unexpected error during session initialization:', err);
    await supabase.auth.signOut();
  }
};

// Call initSession when the client is imported
if (typeof window !== 'undefined') {
  initSession();
}