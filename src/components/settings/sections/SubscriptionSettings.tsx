import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  name: string;
  price: number;
  tenant_limit: number;
}

export function SubscriptionSettings() {
  const { toast } = useToast();

  const { data: subscriptionPlans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");

      if (error) throw error;
      return data as SubscriptionPlan[];
    }
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_plan, role")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: tenantCount } = useQuery({
    queryKey: ["tenant-count"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // First get property IDs owned by the landlord
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("landlord_id", user?.id);

      if (propError) throw propError;

      if (!properties?.length) return 0;

      // Then count active tenancies for these properties
      const { count, error } = await supabase
        .from("tenancies")
        .select("*", { count: 'exact', head: true })
        .eq("status", "active")
        .in("property_id", properties.map(p => p.id));

      if (error) throw error;
      return count || 0;
    },
    enabled: profile?.role === "landlord"
  });

  const currentPlan = subscriptionPlans?.find(plan => plan.name === profile?.subscription_plan);
  const tenantLimit = currentPlan?.tenant_limit || 5;
  const usagePercentage = ((tenantCount || 0) / tenantLimit) * 100;

  const handleUpgrade = async (planName: string) => {
    // TODO: Implement Stripe integration for subscription upgrade
    toast({
      title: "Coming Soon",
      description: "Subscription upgrades will be available soon!",
    });
  };

  if (!profile?.role || profile.role !== "landlord") {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Subscription & Limits</h2>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan: {currentPlan?.name.toUpperCase()}</CardTitle>
          <CardDescription>
            You can add up to {tenantLimit} tenants with your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Tenant Usage</span>
                <span>{tenantCount} / {tenantLimit}</span>
              </div>
              <div className="w-full bg-secondary">
                <Progress value={usagePercentage} className="w-full" />
              </div>
              {usagePercentage >= 80 && (
                <div className="flex items-center gap-2 mt-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    You're approaching your tenant limit. Consider upgrading your plan.
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-4 mt-6">
              {subscriptionPlans?.map((plan) => (
                <Card key={plan.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {plan.name === "gold" && <Crown className="h-4 w-4 text-yellow-500" />}
                          {plan.name.toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">Up to {plan.tenant_limit} tenants</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${plan.price}/month</div>
                        {plan.name !== profile?.subscription_plan && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpgrade(plan.name)}
                            className="mt-2"
                          >
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}