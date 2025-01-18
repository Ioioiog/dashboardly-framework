import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UtilityDialog } from "@/components/utilities/UtilityDialog";
import { UtilityList } from "@/components/utilities/UtilityList";
import { UtilityFilters } from "@/components/utilities/UtilityFilters";
import { useProperties } from "@/hooks/useProperties";
import { Loader2 } from "lucide-react";

interface Utility {
  id: string;
  property_id: string;
  type: string;
  amount: number;
  due_date: string;
  status: string;
  property: {
    name: string;
    address: string;
  };
}

const Utilities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { properties } = useProperties({ 
    userRole: userRole || "tenant" 
  });

  const fetchUtilities = async () => {
    try {
      let query = supabase
        .from('utilities')
        .select(`
          *,
          property:properties (
            name,
            address
          )
        `)
        .order('due_date', { ascending: false });

      if (userRole === 'tenant') {
        // For tenants, get utilities for properties they're actively renting
        const { data: tenantProperties } = await supabase
          .from('tenancies')
          .select('property_id')
          .eq('tenant_id', userId)
          .eq('status', 'active');

        if (tenantProperties) {
          const propertyIds = tenantProperties.map(tp => tp.property_id);
          query = query.in('property_id', propertyIds);
        }
      } else if (userRole === 'landlord') {
        // For landlords, get utilities for their properties
        query = query.in('property_id', properties.map(p => p.id));
      }

      const { data: utilitiesData, error: utilitiesError } = await query;

      if (utilitiesError) {
        console.error("Error fetching utilities:", utilitiesError);
        throw utilitiesError;
      }

      console.log("Fetched utilities:", utilitiesData);
      setUtilities(utilitiesData || []);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in utilities page:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        setUserRole(profile.role as "landlord" | "tenant");
        await fetchUtilities();

      } catch (error: any) {
        console.error("Error in utilities page:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred",
        });
        setIsLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  const filteredUtilities = utilities.filter(utility => {
    const matchesStatus = statusFilter === "all" || utility.status === statusFilter;
    const matchesType = typeFilter === "all" || utility.type === typeFilter;
    return matchesStatus && matchesType;
  });

  if (isLoading || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-8 ml-64">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Utilities</CardTitle>
            <div className="flex items-center gap-4">
              <UtilityFilters
                status={statusFilter}
                onStatusChange={setStatusFilter}
                type={typeFilter}
                onTypeChange={setTypeFilter}
              />
              {userRole === "landlord" && properties && (
                <UtilityDialog
                  properties={properties}
                  onUtilityCreated={fetchUtilities}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <UtilityList
              utilities={filteredUtilities}
              userRole={userRole}
              onStatusUpdate={fetchUtilities}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Utilities;
