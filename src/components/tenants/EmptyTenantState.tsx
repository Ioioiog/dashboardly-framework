import { Card } from "@/components/ui/card";

interface EmptyTenantStateProps {
  userRole: "landlord" | "tenant";
}

export function EmptyTenantState({ userRole }: EmptyTenantStateProps) {
  return (
    <Card className="p-6">
      <div className="text-center text-gray-500">
        {userRole === "landlord" 
          ? "No tenants found. Add your first tenant to get started!"
          : "No active leases found."}
      </div>
    </Card>
  );
}