import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { TenantInviteDialog } from "@/components/tenants/TenantInviteDialog";
import { Property } from "@/utils/propertyUtils";

const Tenants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to auth");
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Could not fetch user profile",
          variant: "destructive",
        });
        return;
      }

      if (profile?.role) {
        setUserRole(profile.role as "landlord" | "tenant");
        
        // If user is a landlord, fetch their properties
        if (profile.role === "landlord") {
          const { data: propertiesData, error: propertiesError } = await supabase
            .from("properties")
            .select("*")
            .eq("landlord_id", session.user.id);

          if (propertiesError) {
            console.error("Error fetching properties:", propertiesError);
            toast({
              title: "Error",
              description: "Could not fetch properties",
              variant: "destructive",
            });
            return;
          }

          setProperties(propertiesData);
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (!userId || !userRole) return null;

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {userRole === "landlord" ? "Tenants" : "My Tenancy"}
              </h1>
              <p className="mt-2 text-dashboard-text">
                {userRole === "landlord"
                  ? "Manage and view your property tenants."
                  : "View your tenancy details."}
              </p>
            </div>
            {userRole === "landlord" && (
              <TenantInviteDialog properties={properties} />
            )}
          </header>

          <div className="space-y-8">
            <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
              <p className="text-muted-foreground">
                Tenant management is being rebuilt. Please check back soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tenants;