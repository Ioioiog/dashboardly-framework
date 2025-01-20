import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { UtilityDialog } from "@/components/utilities/UtilityDialog";
import { UtilityList } from "@/components/utilities/UtilityList";
import { UtilityFilters } from "@/components/utilities/UtilityFilters";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  name: string;
  address: string;
}

export default function Utilities() {
  const [utilities, setUtilities] = useState<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const { userRole } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchUtilities();
    fetchProperties();
  }, [status, type]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address");

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load properties",
      });
    }
  };

  const fetchUtilities = async () => {
    try {
      console.log("Fetching utilities...");
      setIsLoading(true);

      let query = supabase
        .from("utilities")
        .select(`
          *,
          property:properties (
            name,
            address
          )
        `);

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log("Utilities fetched:", data);
      setUtilities(data || []);
    } catch (error) {
      console.error("Error fetching utilities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load utilities",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUtilityCreated = () => {
    fetchUtilities();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
  };

  if (!userRole) return null;

  return (
    <DashboardSidebar>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle>Utilities</CardTitle>
          {userRole === "landlord" && (
            <UtilityDialog
              properties={properties}
              onUtilityCreated={handleUtilityCreated}
            />
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <UtilityFilters
              status={status}
              onStatusChange={handleStatusChange}
              type={type}
              onTypeChange={handleTypeChange}
            />
          </div>
          <UtilityList
            utilities={utilities}
            userRole={userRole}
            onStatusUpdate={fetchUtilities}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </DashboardSidebar>
  );
}