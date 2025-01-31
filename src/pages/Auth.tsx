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
import { RoleSpecificForm } from "@/components/auth/RoleSpecificForm";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("tenant");
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

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
        console.log("User signed in, updating metadata with role:", selectedRole);
        
        try {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: selectedRole }
          });

          if (updateError) {
            console.error("Error updating user metadata:", updateError);
            throw updateError;
          }

          if (session.user.email) {
            setUserEmail(session.user.email);
            setShowRoleForm(true);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          toast({
            title: "Error",
            description: "Failed to update user role. Please try again.",
            variant: "destructive",
          });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, selectedRole]);

  const handleRoleFormComplete = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold">
              <span className="text-blue-600">Admin</span>
              <span className="text-blue-800">Chirii</span>
              <span className="text-slate-500 font-light">.ro</span>
            </h1>
          </div>
          <CardTitle className="text-2xl">Property Management</CardTitle>
          <CardDescription>
            {showRoleForm ? "Complete your profile" : "Choose your role and sign in to your account"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showRoleForm ? (
            <RoleSpecificForm 
              role={selectedRole}
              email={userEmail}
              onComplete={handleRoleFormComplete}
            />
          ) : (
            <>
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
                        brand: '#007bff',
                        brandAccent: '#0056b3',
                        brandButtonText: 'white',
                        defaultButtonBackground: 'white',
                        defaultButtonBackgroundHover: '#f8fafc',
                        defaultButtonBorder: 'lightgray',
                        defaultButtonText: 'gray',
                        dividerBackground: '#e2e8f0',
                        inputBackground: 'white',
                        inputBorder: '#e2e8f0',
                        inputBorderHover: '#cbd5e1',
                        inputBorderFocus: '#007bff',
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
              />
              {password && <PasswordStrength password={password} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;