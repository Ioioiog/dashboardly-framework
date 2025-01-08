import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function StripeAccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [stripeConnected, setStripeConnected] = useState(false);

  const checkStripeConnection = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setStripeConnected(!!profile?.stripe_account_id);
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
    }
  };

  // Check connection status on mount
  useEffect(() => {
    checkStripeConnection();
  }, []);

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get Stripe connect URL');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectStripe = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ stripe_account_id: null })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setStripeConnected(false);
      toast({
        title: "Success",
        description: "Stripe account disconnected successfully",
      });
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Stripe account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Stripe account to receive payments from tenants.
        </p>
        {stripeConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-green-600">
              ✓ Your Stripe account is connected
            </p>
            <Button
              variant="destructive"
              onClick={handleDisconnectStripe}
              disabled={isLoading}
            >
              {isLoading ? "Disconnecting..." : "Disconnect Stripe"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnectStripe}
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect Stripe Account"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}