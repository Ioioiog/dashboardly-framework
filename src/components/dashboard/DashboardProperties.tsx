import { useProperties } from "@/hooks/useProperties";
import { PropertyList } from "../properties/PropertyList";
import { Property } from "@/utils/propertyUtils";

interface DashboardPropertiesProps {
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function DashboardProperties({ 
  userRole,
  onEdit,
  onDelete,
}: DashboardPropertiesProps) {
  const { properties, isLoading } = useProperties({ userRole });

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