import { format } from "date-fns";
import { Tenant } from "@/types/tenant";

interface TenantInfoProps {
  tenant: Tenant;
  getTenantDisplayName: (tenant: Tenant) => string;
}

export function TenantInfo({ tenant, getTenantDisplayName }: TenantInfoProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{tenant.email || "N/A"}</p>
      <p className="text-sm text-muted-foreground">{tenant.phone || "N/A"}</p>
      <p className="text-sm">{tenant.property.name} ({tenant.property.address})</p>
      <div className="text-sm">
        <p>Start: {tenant.tenancy?.start_date ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy") : "N/A"}</p>
        <p>End: {tenant.tenancy?.end_date ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy") : "Ongoing"}</p>
      </div>
    </div>
  );
}