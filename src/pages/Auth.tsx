import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Users } from "lucide-react";

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "tenant":
        return <Home className="w-4 h-4" />;
      case "landlord":
        return <Building2 className="w-4 h-4" />;
      case "service_provider":
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold">
              <span className="text-blue-600">Admin</span>
              <span className="text-blue-800">Chirii</span>
              <span className="text-slate-500 font-light">.ro</span>
            </h1>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Choose your role and sign in to your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role-select" className="text-sm font-medium text-gray-700">
              I am a...
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant" className="flex items-center gap-2">
                  <Home className="w-4 h-4" /> Tenant
                </SelectItem>
                <SelectItem value="landlord" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Landlord
                </SelectItem>
                <SelectItem value="service_provider" className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Service Provider
                </SelectItem>
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
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'white',
                    defaultButtonBackgroundHover: '#f8fafc',
                    defaultButtonBorder: 'lightgray',
                    defaultButtonText: 'gray',
                    dividerBackground: '#e2e8f0',
                    inputBackground: 'white',
                    inputBorder: '#e2e8f0',
                    inputBorderHover: '#cbd5e1',
                    inputBorderFocus: '#2563eb',
                    inputText: 'black',
                    inputLabelText: '#475569',
                    inputPlaceholder: '#94a3b8',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-lg font-medium transition-colors',
                input: 'rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                label: 'text-sm font-medium text-gray-700',
                loader: 'w-6 h-6 border-2 border-blue-600',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Enter your email',
                  password_input_placeholder: 'Enter your password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create password',
                  email_input_placeholder: 'Enter your email',
                  password_input_placeholder: 'Create a secure password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: "Already have an account? Sign in",
                },
                forgotten_password: {
                  link_text: 'Forgot password?',
                  button_label: 'Send reset instructions',
                  loading_button_label: 'Sending reset instructions...',
                  confirmation_text: 'Check your email for the password reset link',
                },
              },
            }}
            onlyThirdPartyProviders={false}
            magicLink={false}
            queryParams={{
              role: selectedRole
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;