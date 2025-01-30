import React from "react";
import { Tenant } from "@/types/tenant";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { TenancyStatus } from "./TenancyStatus";
import { TenantInfo } from "./TenantInfo";
import { TenantActions } from "./TenantActions";

interface TenantCardProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => Promise<void>;
  onUpdate: () => void;
  getTenantDisplayName: (tenant: Tenant) => string;
}

export function TenantCard({
  tenant,
  onDelete,
  onUpdate,
  getTenantDisplayName,
}: TenantCardProps) {
  if (!tenant || !tenant.property) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold">{getTenantDisplayName(tenant)}</h3>
        {tenant.tenancy && (
          <TenancyStatus status={tenant.tenancy.status} />
        )}
      </CardHeader>
      <CardContent>
        <TenantInfo tenant={tenant} getTenantDisplayName={getTenantDisplayName} />
        <TenantActions
          tenantId={tenant.id}
          tenantName={getTenantDisplayName(tenant)}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
}