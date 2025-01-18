import { Property } from "@/utils/propertyUtils";
import { PropertyList } from "@/components/properties/PropertyList";

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
  return (
    <PropertyList
      properties={[]} // This will show the loading state
      isLoading={true}
      userRole={userRole}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}