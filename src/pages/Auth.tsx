import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isPasswordReset = location.hash.includes('type=recovery');

  useEffect(() => {
    const checkUser = async () => {
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
      if (session && !isPasswordReset) {
        navigate("/dashboard");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (event === 'SIGNED_IN') {
          console.log("User signed in successfully");
          navigate("/dashboard");
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          toast({
            title: "Success",
            description: "Your password has been updated successfully.",
          });
          navigate("/dashboard");
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery requested");
          navigate("/update-password");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast, isPasswordReset]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-8 text-gray-900">
          {isPasswordReset ? "Update Password" : "PropertyHub"}
        </h1>
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