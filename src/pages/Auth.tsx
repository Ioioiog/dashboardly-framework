import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const isPasswordReset = location.hash.includes('type=recovery');
  const invitationToken = searchParams.get('invitation');

  useEffect(() => {
    console.log("Auth page mounted");
    const checkUser = async () => {
      try {
        console.log("Checking user session...");
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error.message);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message,
          });
          setIsLoading(false);
          return;
        }

        if (invitationToken) {
          console.log("Found invitation token, redirecting to tenant registration");
          navigate(`/tenant-registration?invitation=${invitationToken}`);
          return;
        }

        if (session && !isPasswordReset) {
          console.log("User is authenticated, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN') {
          console.log("User signed in successfully");
          
          if (invitationToken) {
            console.log("Processing invitation token:", invitationToken);
            navigate(`/tenant-registration?invitation=${invitationToken}`);
            return;
          }
          
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast, isPasswordReset, invitationToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-600">Admin</span>
            <span className="text-blue-800">Chirii</span>
            <span className="text-slate-500 font-light">.ro</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            simplificăm administrarea chiriilor
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          view={isPasswordReset ? "update_password" : "sign_in"}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0F172A',
                  brandAccent: '#1E293B',
                  brandButtonText: 'white',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded-lg',
              input: 'rounded-lg border-gray-300',
              label: 'text-sm font-medium text-gray-700',
            },
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default AuthPage;