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
      flowType: 'pkce'
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
    // Clear any existing invalid sessions first
    const existingSession = await supabase.auth.getSession();
    if (existingSession.error) {
      console.error('Error with existing session:', existingSession.error);
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      return;
    }

    // Set up session refresh handling
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing session data');
        localStorage.removeItem('supabase.auth.token');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in, session established');
      }
    });

  } catch (err) {
    console.error('Unexpected error during session initialization:', err);
    // Clear any invalid session data
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
  }
};

// Call initSession when the client is imported in browser environment
if (typeof window !== 'undefined') {
  initSession();
}