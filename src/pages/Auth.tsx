import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isPasswordReset = location.hash.includes('type=recovery');
  const invitationToken = searchParams.get('invitation');

  useEffect(() => {
    const checkUser = async () => {
      console.log("Checking user session on Auth page...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error.message);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
        return;
      }

      if (session?.user) {
        console.log("User is already authenticated, redirecting to dashboard");
        navigate("/dashboard");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed in Auth page:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("Sign in successful, redirecting...");
          
          if (invitationToken) {
            console.log("Processing invitation token:", invitationToken);
            navigate(`/tenant-registration?invitation=${invitationToken}`);
            return;
          }
          
          navigate("/dashboard");
        }

        if (event === 'SIGNED_OUT') {
          console.log("User signed out");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast, isPasswordReset, invitationToken]);

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
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;