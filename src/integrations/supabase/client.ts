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

    console.log('Valid session found:', session.user.id);
    
    // Test realtime connection
    const channel = supabase.channel('system');
    
    channel
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      })
      .then((response) => {
        if (response === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates');
        } else {
          console.error('Failed to subscribe to realtime updates:', response);
        }
      })
      .catch((err) => {
        console.error('Error establishing realtime connection:', err);
      });

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