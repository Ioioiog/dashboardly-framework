import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AcceptInvitationForm } from "@/components/tenants/AcceptInvitationForm";
import type { TenantInvitation } from "@/types/tenant-invitations";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<TenantInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const { error: rpcError } = await supabase.rpc('set_claim', {
        params: {
          name: 'app.current_token',
          value: token
        }
      });

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

  if (isLoading || !invitation) {
    return (
      <div className="container max-w-lg mx-auto mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto mt-8">
      <AcceptInvitationForm invitation={invitation} />
    </div>
  );
}