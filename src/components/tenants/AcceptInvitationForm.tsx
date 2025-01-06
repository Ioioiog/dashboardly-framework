import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TenantInvitation } from "@/types/tenant-invitations";

interface AcceptInvitationFormProps {
  invitation: TenantInvitation;
}

export function AcceptInvitationForm({ invitation }: AcceptInvitationFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptInvitation = async () => {
    setIsAccepting(true);
    try {
      // First check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not signed in, create new account
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

        if (signUpError) {
          if (signUpError.message === "User already registered") {
            toast({
              title: "Account exists",
              description: "Please sign in to accept the invitation.",
              variant: "default",
            });
            navigate("/auth");
            return;
          }
          throw signUpError;
        }

        if (!authData.user) throw new Error("Failed to create user account");
      }

      // Create tenancy
      const { error: tenancyError } = await supabase.from("tenancies").insert({
        property_id: invitation.property_id,
        tenant_id: session?.user.id,
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
        description: session 
          ? "Invitation accepted! You can now access your tenant portal."
          : "Account created! Check your email to set your password and access your account.",
      });

      // Redirect to auth page for password setup or dashboard if already signed in
      navigate(session ? "/dashboard" : "/auth");
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

  return (
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
  );
}