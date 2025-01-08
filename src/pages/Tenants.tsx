import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { TenantInviteDialog } from "@/components/tenants/TenantInviteDialog";
import { TenantList } from "@/components/tenants/TenantList";
import { useTenants } from "@/hooks/useTenants";
import { Property } from "@/utils/propertyUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Home, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Tenants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const { data: tenants = [], isLoading, error: tenantsError } = useTenants();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking user session...");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);
        console.log("User ID set:", session.user.id);

        // Fetch profile with maybeSingle to handle missing profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (!profile) {
          console.log("No profile found, creating one...");
          const { error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                role: "tenant", // Default role
              },
            ]);

          if (createError) {
            console.error("Error creating profile:", createError);
            throw createError;
          }

          setUserRole("tenant");
        } else {
          console.log("Profile role:", profile.role);
          setUserRole(profile.role as "landlord" | "tenant");
        }

        setIsCheckingProfile(false);

        // Rest of the existing code for fetching tenant info and properties
        if (profile?.role === "tenant") {
          const { data: tenancyData, error: tenancyError } = await supabase
            .from("tenancies")
            .select(`
              *,
              property:properties (
                name,
                address,
                monthly_rent,
                type
              )
            `)
            .eq("tenant_id", session.user.id)
            .eq("status", "active")
            .maybeSingle();

          if (tenancyError) {
            console.error("Error fetching tenancy:", tenancyError);
            return;
          }

          if (tenancyData) {
            console.log("Tenancy data:", tenancyData);
            setTenantInfo(tenancyData);
          }
        }

        if (profile?.role === "landlord") {
          console.log("Fetching properties for landlord");
          const { data: propertiesData, error: propertiesError } = await supabase
            .from("properties")
            .select("*")
            .eq("landlord_id", session.user.id);

          if (propertiesError) {
            console.error("Properties fetch error:", propertiesError);
            throw propertiesError;
          }

          console.log("Properties fetched:", propertiesData?.length);
          setProperties(propertiesData || []);
        }
      } catch (error: any) {
        console.error("Error in checkUser:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (isCheckingProfile) {
    return (
      <div className="flex bg-dashboard-background min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userId || !userRole) return null;

  if (tenantsError) {
    return (
      <div className="flex bg-dashboard-background min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <Alert variant="destructive">
            <AlertDescription>
              Error loading tenant data. Please try again later.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

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
            {userRole === "landlord" ? (
              <TenantList tenants={tenants} />
            ) : tenantInfo ? (
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Property</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenantInfo.property.name}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tenantInfo.property.address}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lease Period</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Date(tenantInfo.start_date).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tenantInfo.end_date
                        ? `Until ${new Date(tenantInfo.end_date).toLocaleDateString()}`
                        : "No end date"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${tenantInfo.property.monthly_rent}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tenantInfo.property.type}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                <p className="text-muted-foreground">
                  No active tenancy found. Please contact your landlord if you believe this is an error.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tenants;
