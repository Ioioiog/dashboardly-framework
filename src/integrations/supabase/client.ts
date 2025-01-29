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
        'X-Client-Info': 'supabase-js-web/2.1.0'
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
  try {
    console.log('Initializing Supabase session...');
    
    // Try to recover the session from storage first
    const storedSession = localStorage.getItem('sb-wecmvyohaxizmnhuvjly-auth-token');
    if (!storedSession) {
      console.log('No stored session found');
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      await supabase.auth.signOut();
      return;
    }

    if (!session) {
      console.log('No active session found');
      await supabase.auth.signOut();
      return;
    }

    // Verify the session is still valid
    const { error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User verification failed:', userError);
      await supabase.auth.signOut();
      return;
    }

    console.log('Valid session found:', session.user.id);
    
  } catch (err) {
    console.error('Unexpected error during session initialization:', err);
    await supabase.auth.signOut();
  }
};

// Call initSession when the client is imported in browser environment
if (typeof window !== 'undefined') {
  console.log('Browser environment detected, initializing session...');
  initSession();
}