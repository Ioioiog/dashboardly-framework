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
    debug: true // Enable debug logs
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js@2.7.1',
    },
  },
  db: {
    schema: 'public'
  }
});

// Add debug logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, 'Session exists:', !!session);
  if (session?.user) {
    console.log('User ID:', session.user.id);
    console.log('User email:', session.user.email);
  }
});

// Helper function to check auth status with proper error handling
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth status check failed:', error.message);
      return { session: null, error };
    }
    return { session, error: null };
  } catch (error) {
    console.error('Unexpected error checking auth status:', error);
    return { 
      session: null, 
      error: new Error('Failed to check authentication status')
    };
  }
};

// Helper function to handle API errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase operation failed:', error);
  
  if (!navigator.onLine) {
    return new Error('Network error - please check your internet connection');
  }
  
  if (error.status === 401) {
    return new Error('Session expired - please sign in again');
  }
  
  return new Error(error.message || 'An unexpected error occurred');
};

// Helper function to refresh session
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh failed:', error.message);
      return { session: null, error };
    }
    return { session, error: null };
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return {
      session: null,
      error: new Error('Failed to refresh session')
    };
  }
};