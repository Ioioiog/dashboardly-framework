import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Home, Calendar } from "lucide-react";

interface TenantCardProps {
  tenant: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    property: {
      name: string;
      address: string;
    };
    tenancy: {
      start_date: string;
      end_date: string | null;
      status: string;
    };
  };
  userRole: "landlord" | "tenant";
}

export function TenantCard({ tenant, userRole }: TenantCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {userRole === "landlord" && tenant.first_name && tenant.last_name
              ? `${tenant.first_name} ${tenant.last_name}`
              : "Tenant"}
          </span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            tenant.tenancy.status === 'invitation_pending'
              ? "bg-yellow-100 text-yellow-800"
              : tenant.tenancy.status === "active" 
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
          }`}>
            {tenant.tenancy.status === 'invitation_pending' ? 'Invitation Pending' : tenant.tenancy.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <Home className="w-4 h-4 mt-1 text-gray-500" />
          <div>
            <div className="font-medium">{tenant.property.name}</div>
            <div className="text-sm text-gray-500">{tenant.property.address}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="text-sm">
            <span>From: {format(new Date(tenant.tenancy.start_date), "PP")}</span>
            {tenant.tenancy.end_date && (
              <>
                <br />
                <span>To: {format(new Date(tenant.tenancy.end_date), "PP")}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}