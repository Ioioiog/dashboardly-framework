import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PostgrestError } from "@supabase/supabase-js";

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
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in successfully");
          
          if (invitationToken) {
            console.log("Processing invitation token:", invitationToken);
            try {
              const { error: claimError } = await supabase.rpc('set_claim', {
                params: { value: invitationToken }
              });

              if (claimError) throw claimError;

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

              const { data: propertyAssignments, error: propertyError } = await supabase
                .from('tenant_invitation_properties')
                .select('property_id')
                .eq('invitation_id', invitation.id);

              if (propertyError) throw propertyError;

              for (const assignment of propertyAssignments || []) {
                const { error: tenancyError } = await supabase
                  .from('tenancies')
                  .insert({
                    property_id: assignment.property_id,
                    tenant_id: session.user.id,
                    start_date: invitation.start_date,
                    end_date: invitation.end_date,
                    status: 'active'
                  });

                if (tenancyError) throw tenancyError;
              }

              const { error: updateError } = await supabase
                .from('tenant_invitations')
                .update({ status: 'accepted' })
                .eq('token', invitationToken);

              if (updateError) throw updateError;

              toast({
                title: "Welcome!",
                description: "Your account has been set up successfully.",
              });
            } catch (error) {
              console.error("Error processing invitation:", error);
              const errorMessage = error instanceof PostgrestError 
                ? error.message 
                : 'Failed to process invitation';
              
              toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
              });
            }
          }
          
          navigate("/dashboard");
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
              message: 'text-sm text-red-600',
            },
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;