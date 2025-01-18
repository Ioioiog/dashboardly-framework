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

  console.log("Properties data:", properties);
  console.log("Loading state:", isLoading);

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