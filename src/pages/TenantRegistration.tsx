import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { tenantAuditService } from "@/services/tenantAuditService";

const TenantRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const invitationToken = searchParams.get('invitation');
  const [invitation, setInvitation] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationToken) {
        console.log("No invitation token found");
        setValidationError("No invitation token provided");
        navigate("/auth");
        return;
      }

      try {
        console.log("Setting token in database context");
        await supabase.rpc('set_claim', {
          params: { value: invitationToken }
        });

        console.log("Fetching invitation details");
        const { data, error } = await supabase
          .from('tenant_invitations')
          .select('*, property:properties(name)')
          .eq('token', invitationToken)
          .single();

        if (error) {
          console.error("Error fetching invitation:", error);
          throw new Error("Invalid invitation");
        }

        if (!data) {
          console.log("Invalid or expired invitation");
          setValidationError("This invitation link is invalid or has expired");
          navigate("/auth");
          return;
        }

        // Check if invitation is expired or used
        if (new Date(data.expiration_date) < new Date()) {
          console.log("Invitation has expired");
          setValidationError("This invitation has expired");
          navigate("/auth");
          return;
        }

        if (data.used) {
          console.log("Invitation has already been used");
          setValidationError("This invitation has already been used");
          navigate("/auth");
          return;
        }

        console.log("Valid invitation found:", data);
        setInvitation(data);
      } catch (error) {
        console.error("Error validating invitation:", error);
        setValidationError("Failed to verify invitation");
        navigate("/auth");
      }
    };

    fetchInvitation();
  }, [invitationToken, navigate, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session && invitation) {
          try {
            console.log("Processing new tenant registration");
            
            // Mark invitation as used
            const { error: updateError } = await supabase
              .from('tenant_invitations')
              .update({ 
                status: 'accepted',
                used: true 
              })
              .eq('token', invitationToken);

            if (updateError) throw updateError;
            
            // Update the profile
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

            // Get property assignments
            const { data: propertyAssignments, error: assignmentsError } = await supabase
              .from('tenant_invitation_properties')
              .select('property_id')
              .eq('invitation_id', invitation.id);

            if (assignmentsError) throw assignmentsError;

            // Create tenancies for each property
            const tenancyPromises = propertyAssignments.map(async (assignment) => {
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
            });

            await Promise.all(tenancyPromises);

            // Log the invitation acceptance
            await tenantAuditService.logTenantAction({
              action_type: 'invitation_accepted',
              landlord_id: invitation.landlord_id,
              tenant_id: session.user.id,
              tenant_email: invitation.email,
              property_ids: propertyAssignments.map(pa => pa.property_id),
              metadata: {
                start_date: invitation.start_date,
                end_date: invitation.end_date
              }
            });

            toast({
              title: "Welcome!",
              description: "Your account has been set up successfully. Redirecting to your dashboard...",
            });

            // Add a small delay to ensure the toast is visible
            setTimeout(() => {
              navigate("/dashboard");
            }, 1500);
            
          } catch (error) {
            console.error("Error setting up tenant account:", error);
            toast({
              title: "Error",
              description: "Failed to complete registration. Please contact support.",
              variant: "destructive",
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [invitation, invitationToken, navigate, toast]);

  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-4">{validationError}</p>
          <button
            onClick={() => navigate("/auth")}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          <p className="text-center text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-2 text-gray-900">
          Complete Your Registration
        </h1>
        <p className="text-center text-gray-600 mb-6">
          You've been invited to join {invitation.property.name} as a tenant
        </p>
        <Auth
          supabaseClient={supabase}
          view="sign_up"
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

export default TenantRegistration;