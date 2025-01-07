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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);

        // Fetch profile with a simpler query
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "Could not fetch user profile",
            variant: "destructive",
          });
          return;
        }

        if (profileData?.role) {
          setUserRole(profileData.role as "landlord" | "tenant");
          
          // Only fetch properties if user is a landlord
          if (profileData.role === "landlord") {
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

            setProperties(propertiesData || []);
          }
        }
      } catch (error) {
        console.error("Error in checkUser:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
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