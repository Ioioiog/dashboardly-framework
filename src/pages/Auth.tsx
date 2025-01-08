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
      console.log("Checking user session...");
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

      if (session && !isPasswordReset && !invitationToken) {
        console.log("User is authenticated, redirecting to dashboard");
        navigate("/dashboard");
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
            try {
              await supabase.rpc('set_claim', {
                params: { value: invitationToken }
              });

              const { data: invitation, error: inviteError } = await supabase
                .from('tenant_invitations')
                .select('*')
                .eq('token', invitationToken)
                .single();

              if (inviteError) throw inviteError;

              if (!invitation) {
                throw new Error('Invalid or expired invitation');
              }

              const { error: profileError } = await supabase
                .from('profiles')
                .update({
                  first_name: invitation.first_name,
                  last_name: invitation.last_name,
                  email: invitation.email,
                  role: 'tenant'
                })
                .eq('id', session.user.id);

              if (profileError) throw profileError;

              const { error: tenancyError } = await supabase
                .from('tenancies')
                .insert({
                  property_id: invitation.property_id,
                  tenant_id: session.user.id,
                  start_date: invitation.start_date,
                  end_date: invitation.end_date,
                  status: 'active'
                });

              if (tenancyError) throw tenancyError;

              const { error: updateError } = await supabase
                .from('tenant_invitations')
                .update({ status: 'accepted' })
                .eq('token', invitationToken);

              if (updateError) throw updateError;

              toast({
                title: "Welcome!",
                description: "Your account has been set up successfully.",
              });
            } catch (error: any) {
              console.error("Error processing invitation:", error);
              toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to process invitation",
              });
            }
          }
          
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

        // Handle auth errors
        if (event === 'SIGNED_IN') {
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.error("Auth error:", error);
            let errorMessage = "An error occurred during authentication.";
            
            if (error.message.includes("Email not confirmed")) {
              errorMessage = "Please verify your email before signing in.";
            } else if (error.message.includes("Invalid login credentials")) {
              errorMessage = "Invalid email or password. Please try again.";
            } else if (error.message.includes("User already registered")) {
              errorMessage = "An account with this email already exists. Please sign in instead.";
            }
            
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: errorMessage,
            });
          }
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
        />
      </div>
    </div>
  );
};

export default AuthPage;