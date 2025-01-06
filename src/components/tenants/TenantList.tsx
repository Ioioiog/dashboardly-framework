import React from "react";
import { TenantCard } from "./TenantCard";
import { TenantListSkeleton } from "./TenantListSkeleton";
import { EmptyTenantState } from "./EmptyTenantState";
import type { Property, Tenant } from "@/types/tenant";

interface TenantListProps {
  tenants: Tenant[] | undefined;
  isLoading: boolean;
  userRole: "landlord" | "tenant";
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export function TenantList({ 
  tenants, 
  isLoading, 
  userRole, 
  onEdit, 
  onDelete 
}: TenantListProps) {
  if (isLoading) {
    return <TenantListSkeleton />;
  }

  if (!tenants?.length) {
    return <EmptyTenantState userRole={userRole} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.id}
          tenant={tenant}
          userRole={userRole}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}