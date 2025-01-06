import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
}

async function fetchProperties(userId: string, userRole: string) {
  console.log("Fetching properties for user:", userId, "with role:", userRole);
  
  if (userRole === "landlord") {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_id", userId);

    if (error) {
      console.error("Error fetching landlord properties:", error);
      throw error;
    }

    console.log("Fetched landlord properties:", data);
    return data;
  } else {
    // For tenants, get properties through active tenancies
    const { data, error } = await supabase
      .from("tenancies")
      .select(`
        property:properties (
          id,
          name,
          address,
          monthly_rent
        )
      `)
      .eq("tenant_id", userId)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching tenant properties:", error);
      throw error;
    }

    console.log("Fetched tenant properties:", data);
    return data.map(tenancy => tenancy.property);
  }
}

export function DashboardProperties({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["dashboard-properties", userId, userRole],
    queryFn: () => fetchProperties(userId, userRole),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!properties?.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {userRole === "landlord" 
            ? "No properties found. Add your first property to get started!"
            : "No active leases found."}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property: Property) => (
        <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-medium">{property.name}</h3>
            </div>
          </div>
          <div className="flex items-start text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{property.address}</span>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium">
              Monthly Rent: ${property.monthly_rent.toLocaleString()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}