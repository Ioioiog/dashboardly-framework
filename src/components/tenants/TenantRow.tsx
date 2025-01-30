import React from "react";
import { Tenant } from "@/types/tenant";
import { TableCell, TableRow } from "@/components/ui/table";
import { TenancyStatus } from "./TenancyStatus";
import { TenantInfo } from "./TenantInfo";
import { TenantActions } from "./TenantActions";

interface TenantRowProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => Promise<void>;
  onUpdate: () => void;
  getTenantDisplayName: (tenant: Tenant) => string;
}

export function TenantRow({
  tenant,
  onDelete,
  onUpdate,
  getTenantDisplayName,
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
        {tenant.tenancy?.start_date || "N/A"}
      </TableCell>
      <TableCell>
        {tenant.tenancy?.end_date || "Ongoing"}
      </TableCell>
      <TableCell>
        {tenant.tenancy && (
          <TenancyStatus status={tenant.tenancy.status} />
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