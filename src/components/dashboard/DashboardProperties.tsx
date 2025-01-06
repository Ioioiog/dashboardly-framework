import { useProperties } from "@/hooks/useProperties";
import { PropertyList } from "../properties/PropertyList";

export function DashboardProperties({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
  const { properties, isLoading, handleEdit, handleDelete } = useProperties({ userId, userRole });

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