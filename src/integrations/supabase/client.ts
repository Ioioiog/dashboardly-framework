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
      storageKey: 'sb-wecmvyohaxizmnhuvjly-auth-token',
      flowType: 'pkce',
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
    console.log('Initializing Supabase session...');
    
    // First, try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      await handleInvalidSession();
      return;
    }

    if (!session) {
      console.log('No active session found');
      await handleInvalidSession();
      return;
    }

    console.log('Valid session found:', session.user.id);

    // Set up session refresh handling
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null');
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session expired, clearing session data');
        await handleInvalidSession();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Session token refreshed successfully');
      }
    });

  } catch (err) {
    console.error('Unexpected error during session initialization:', err);
    await handleInvalidSession();
  }
};

// Helper function to handle invalid sessions
const handleInvalidSession = async () => {
  console.log('Handling invalid session...');
  try {
    // Clear any existing invalid sessions
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    console.error('Error during signOut:', err);
  }
  
  // Clear all auth-related items from localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('supabase') || key?.includes('sb-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Call initSession when the client is imported in browser environment
if (typeof window !== 'undefined') {
  console.log('Browser environment detected, initializing session...');
  initSession();
}