import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import type { TenantInvitation } from "@/types/tenant-invitations";
import type { SetClaimParams } from "@/integrations/supabase/types/rpc";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<TenantInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation link",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const fetchInvitation = async () => {
      // Set the token in the session for RLS policy
      const params: SetClaimParams = {
        name: 'app.current_token',
        value: token
      };

      const { error: rpcError } = await supabase.rpc('set_claim', { params });

      if (rpcError) {
        console.error("Error setting token claim:", rpcError);
        toast({
          title: "Error",
          description: "Failed to verify invitation",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Fetch the invitation details
      const { data: invitations, error: fetchError } = await supabase
        .from("tenant_invitations")
        .select(`
          *,
          property:properties (
            name,
            address
          )
        `)
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (fetchError || !invitations) {
        console.error("Error fetching invitation:", fetchError);
        toast({
          title: "Error",
          description: "Invalid or expired invitation",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setInvitation(invitations);
      setIsLoading(false);
    };

    fetchInvitation();
  }, [token, navigate, toast]);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: crypto.randomUUID(), // Generate a random password
        options: {
          data: {
            first_name: invitation.first_name,
            last_name: invitation.last_name,
          },
        },
      });

      if (signUpError || !authData.user) throw signUpError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          role: "tenant",
          email: invitation.email,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Create tenancy
      const { error: tenancyError } = await supabase.from("tenancies").insert({
        property_id: invitation.property_id,
        tenant_id: authData.user.id,
        start_date: invitation.start_date,
        end_date: invitation.end_date,
      });

      if (tenancyError) throw tenancyError;

      // Update invitation status
      const { error: invitationError } = await supabase
        .from("tenant_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (invitationError) throw invitationError;

      toast({
        title: "Success",
        description:
          "Invitation accepted! Check your email to set your password and access your account.",
      });

      // Redirect to auth page for password setup
      navigate("/auth");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || !invitation) {
    return (
      <div className="container max-w-lg mx-auto mt-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto mt-8">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Tenant Invitation</h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Property</p>
            <p className="font-medium">
              {invitation.property?.name} - {invitation.property?.address}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tenant</p>
            <p className="font-medium">
              {invitation.first_name} {invitation.last_name}
            </p>
            <p className="text-sm text-gray-600">{invitation.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lease Period</p>
            <p className="font-medium">
              From: {new Date(invitation.start_date).toLocaleDateString()}
              {invitation.end_date &&
                ` To: ${new Date(invitation.end_date).toLocaleDateString()}`}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleAcceptInvitation}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept Invitation"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
