import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("tenant");

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "Session Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (session) {
          console.log("Active session found, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
        toast({
          title: "Unexpected Error",
          description: "An error occurred while checking your session",
          variant: "destructive",
        });
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Sign in successful, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === 'USER_UPDATED') {
        console.log("User profile updated");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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

        <div className="mb-6">
          <Label htmlFor="role-select" className="text-sm font-medium text-gray-700">
            Select Role
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="landlord">Landlord</SelectItem>
              <SelectItem value="service_provider">Service Provider</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Auth
          supabaseClient={supabase}
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
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Create a password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
              },
            },
          }}
          onlyThirdPartyProviders={false}
          magicLink={false}
          queryParams={{
            role: selectedRole
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;