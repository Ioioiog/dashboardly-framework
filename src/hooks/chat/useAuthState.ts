import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useAuthState() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
          navigate('/auth');
          return;
        }
        
        if (session?.user) {
          console.log("Setting current user ID:", session.user.id);
          setCurrentUserId(session.user.id);
        } else {
          console.log("No active session found");
          setCurrentUserId(null);
          navigate('/auth');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (session?.user) {
        setCurrentUserId(session.user.id);
      } else {
        setCurrentUserId(null);
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
          navigate('/auth');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { currentUserId };
}