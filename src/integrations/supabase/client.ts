import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://wecmvyohaxizmnhuvjly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY212eW9oYXhpem1uaHV2amx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjU1MzEsImV4cCI6MjA1MTcwMTUzMX0.XsX604t39-TAAotJv9qbSCfNJlVE0u02arYHtrZIgYs';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
    debug: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js@2.7.1',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Add debug logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, 'Session exists:', !!session);
  if (session?.user) {
    console.log('User ID:', session.user.id);
    console.log('User email:', session.user.email);
  }
});

// Add error handling for failed requests
supabase.handleError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check if it's a network error
  if (error.message === 'Failed to fetch') {
    console.error('Network error - check your internet connection');
    return new Error('Network error - please check your internet connection');
  }
  
  // Check if it's an authentication error
  if (error.status === 401) {
    console.error('Authentication error - user not authenticated');
    return new Error('Authentication error - please sign in again');
  }
  
  // Generic error handling
  return new Error(error.message || 'An unexpected error occurred');
};

// Add request interceptor for debugging
supabase.requestInterceptor = (req: Request) => {
  console.log('Outgoing request:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });
  return req;
};

// Export a helper function to check auth status
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { session: null, error };
  }
};