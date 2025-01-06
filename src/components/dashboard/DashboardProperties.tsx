import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyList } from "../properties/PropertyList";
import { useToast } from "@/components/ui/use-toast";

interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
  type: string;
  description?: string;
  available_from?: string;
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
    const { data, error } = await supabase
      .from("tenancies")
      .select(`
        property:properties (
          id,
          name,
          address,
          monthly_rent,
          type,
          description,
          available_from
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
  const { toast } = useToast();
  const { data: properties, isLoading } = useQuery({
    queryKey: ["dashboard-properties", userId, userRole],
    queryFn: () => fetchProperties(userId, userRole),
  });

  const handleEdit = (property: Property) => {
    console.log("Edit property:", property);
    // Will implement edit functionality
  };

  const handleDelete = (property: Property) => {
    console.log("Delete property:", property);
    // Will implement delete functionality
  };

  return (
    <PropertyList
      properties={properties}
      isLoading={isLoading}
      userRole={userRole}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
