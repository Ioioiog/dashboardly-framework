import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { TenantInviteDialog } from "@/components/tenants/TenantInviteDialog";
import { Property } from "@/utils/propertyUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Tenant {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  property: {
    id: string;
    name: string;
    address: string;
  };
  tenancy: {
    start_date: string;
    end_date: string | null;
    status: string;
  };
}

const Tenants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking user session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
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

        // Fetch profile with a direct query
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (!profile) {
          console.error("No profile found for user");
          toast({
            title: "Error",
            description: "User profile not found",
            variant: "destructive",
          });
          return;
        }

        console.log("Profile role:", profile.role);
        setUserRole(profile.role as "landlord" | "tenant");

        // Only fetch properties and tenants for landlords
        if (profile.role === "landlord") {
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

          // Fetch tenants data
          const { data: tenantsData, error: tenantsError } = await supabase
            .from('tenancies')
            .select(`
              tenant_id,
              start_date,
              end_date,
              status,
              profiles!tenancies_tenant_id_fkey (
                id,
                first_name,
                last_name,
                email,
                phone
              ),
              properties (
                id,
                name,
                address
              )
            `)
            .eq('status', 'active');

          if (tenantsError) {
            console.error("Tenants fetch error:", tenantsError);
            throw tenantsError;
          }

          // Transform the data to match our Tenant interface
          const formattedTenants = tenantsData.map((tenancy) => ({
            id: tenancy.profiles.id,
            first_name: tenancy.profiles.first_name,
            last_name: tenancy.profiles.last_name,
            email: tenancy.profiles.email,
            phone: tenancy.profiles.phone,
            property: {
              id: tenancy.properties.id,
              name: tenancy.properties.name,
              address: tenancy.properties.address,
            },
            tenancy: {
              start_date: tenancy.start_date,
              end_date: tenancy.end_date,
              status: tenancy.status,
            },
          }));

          console.log("Tenants fetched:", formattedTenants.length);
          setTenants(formattedTenants);
        }

      } catch (error: any) {
        console.error("Error in checkUser:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (isLoading) {
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
              <div className="rounded-lg border bg-card text-card-foreground shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          {tenant.first_name} {tenant.last_name}
                        </TableCell>
                        <TableCell>
                          <div>{tenant.email}</div>
                          <div className="text-sm text-gray-500">{tenant.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div>{tenant.property.name}</div>
                          <div className="text-sm text-gray-500">{tenant.property.address}</div>
                        </TableCell>
                        <TableCell>{new Date(tenant.tenancy.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {tenant.tenancy.end_date 
                            ? new Date(tenant.tenancy.end_date).toLocaleDateString()
                            : 'No end date'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tenant.tenancy.status === 'active' ? 'default' : 'secondary'}>
                            {tenant.tenancy.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                <p className="text-muted-foreground">
                  Your tenancy information will appear here.
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