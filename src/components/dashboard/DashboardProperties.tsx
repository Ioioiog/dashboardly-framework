import { Property } from "@/utils/propertyUtils";
import { PropertyList } from "@/components/properties/PropertyList";
import { useProperties } from "@/hooks/useProperties";

interface DashboardPropertiesProps {
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
}

export function DashboardProperties({ 
  userRole,
  onEdit,
  onDelete 
}: DashboardPropertiesProps) {
  const { properties, isLoading } = useProperties({ userRole });

  console.log("DashboardProperties - userRole:", userRole);
  console.log("DashboardProperties - properties:", properties);
  console.log("DashboardProperties - isLoading:", isLoading);

  return (
    <PropertyList
      properties={properties}
      isLoading={isLoading}
      userRole={userRole}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}