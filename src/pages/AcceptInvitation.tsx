import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import type { TenantInvitation } from "@/types/tenant-invitations";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<TenantInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      // Set the token in the session for RLS policy
      const { error: rpcError } = await supabase.rpc('set_claim', {
        name: 'app.current_token',
        value: token
      } as { name: string; value: string });

      if (rpcError) {
        console.error("Error setting token claim:", rpcError);
        setError("Error validating invitation");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tenant_invitations")
        .select("*, property:properties(name)")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (error || !data) {
        console.error("Error fetching invitation:", error);
        setError("Invalid or expired invitation");
        setLoading(false);
        return;
      }

      setInvitation(data as TenantInvitation);
      setLoading(false);
    };

    fetchInvitation();
  }, [searchParams]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !password) return;

    try {
      setLoading(true);

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
      });

      if (authError) throw authError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          email: invitation.email,
          role: "tenant",
        })
        .eq("id", authData.user!.id);

      if (profileError) throw profileError;

      // Create tenancy
      const { error: tenancyError } = await supabase
        .from("tenancies")
        .insert({
          property_id: invitation.property_id,
          tenant_id: authData.user!.id,
          start_date: invitation.start_date,
          end_date: invitation.end_date,
          status: "active",
        });

      if (tenancyError) throw tenancyError;

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from("tenant_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Your account has been created successfully. You can now sign in.",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-6">Accept Invitation</h1>
        <div className="mb-6">
          <p className="text-gray-600">
            You've been invited to join {invitation?.property?.name} as a tenant.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Start date: {new Date(invitation?.start_date || '').toLocaleDateString()}</p>
            {invitation?.end_date && (
              <p>End date: {new Date(invitation.end_date).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <form onSubmit={handleAccept} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Set your password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Accept and Create Account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}