import React from "react";
import { TenantCard } from "./TenantCard";
import { TenantListSkeleton } from "./TenantListSkeleton";
import { EmptyTenantState } from "./EmptyTenantState";
import { useTenants } from "@/hooks/useTenants";
import type { Tenant } from "@/types/tenant";

interface TenantListProps {
  isLoading?: boolean;
  userRole: "landlord" | "tenant";
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
  userId: string;
}

export function TenantList({ 
  isLoading: isLoadingProp, 
  userRole, 
  onEdit, 
  onDelete,
  userId 
}: TenantListProps) {
  const { data, isLoading: isLoadingQuery } = useTenants(userId, userRole);
  const isLoading = isLoadingProp || isLoadingQuery;
  const tenants = data?.tenancies || [];

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