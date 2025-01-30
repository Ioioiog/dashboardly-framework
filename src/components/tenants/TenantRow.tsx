import React from "react";
import { Tenant } from "@/types/tenant";
import { TableCell, TableRow } from "@/components/ui/table";
import { TenancyStatus } from "./TenancyStatus";
import { TenantActions } from "./TenantActions";
import { format } from "date-fns";

interface TenantRowProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => Promise<void>;
  onUpdate: () => void;
  getTenantDisplayName: (tenant: Tenant) => string;
  isLandlord?: boolean;
}

export function TenantRow({
  tenant,
  onDelete,
  onUpdate,
  getTenantDisplayName,
  isLandlord = false,
}: TenantRowProps) {
  if (!tenant || !tenant.property) return null;

  return (
    <TableRow>
      <TableCell>{getTenantDisplayName(tenant)}</TableCell>
      <TableCell>{tenant.email || "N/A"}</TableCell>
      <TableCell>{tenant.phone || "N/A"}</TableCell>
      <TableCell>
        {tenant.property.name} ({tenant.property.address})
      </TableCell>
      <TableCell>
        {tenant.tenancy?.start_date ? format(new Date(tenant.tenancy.start_date), 'PP') : 'N/A'}
      </TableCell>
      <TableCell>
        {tenant.tenancy?.end_date ? format(new Date(tenant.tenancy.end_date), 'PP') : 'Ongoing'}
      </TableCell>
      <TableCell>
        {tenant.tenancy && (
          <TenancyStatus 
            status={tenant.tenancy.status} 
            tenancyId={tenant.tenancy.id}
            onStatusChange={onUpdate}
            isLandlord={isLandlord}
          />
        )}
      </TableCell>
      <TableCell className="text-right">
        <TenantActions
          tenantId={tenant.id}
          tenantName={getTenantDisplayName(tenant)}
          tenant={tenant}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      </TableCell>
    </TableRow>
  );
}