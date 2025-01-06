import { useQuery } from "@tanstack/react-query";
import { fetchLandlordProperties, fetchTenantProperties, Property } from "@/utils/propertyUtils";

interface UsePropertiesProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function useProperties({ userId, userRole }: UsePropertiesProps) {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["dashboard-properties", userId, userRole],
    queryFn: () => userRole === "landlord" 
      ? fetchLandlordProperties(userId)
      : fetchTenantProperties(userId),
  });

  const handleEdit = (property: Property) => {
    console.log("Edit property:", property);
    // Will implement edit functionality
  };

  const handleDelete = (property: Property) => {
    console.log("Delete property:", property);
    // Will implement delete functionality
  };

  return {
    properties,
    isLoading,
    handleEdit,
    handleDelete,
  };
}