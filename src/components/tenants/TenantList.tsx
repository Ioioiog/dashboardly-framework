import React from "react";
import { TenantCard } from "./TenantCard";
import { TenantListSkeleton } from "./TenantListSkeleton";
import { EmptyTenantState } from "./EmptyTenantState";
import { useTenants } from "@/hooks/useTenants";
import { TenantDialog } from "./TenantDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
  const properties = data?.properties || [];

  if (isLoading) {
    return <TenantListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {userRole === "landlord" && (
        <div className="flex justify-end mb-4">
          <TenantDialog properties={properties}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </TenantDialog>
        </div>
      )}
      
      {!tenants?.length ? (
        <EmptyTenantState userRole={userRole} />
      ) : (
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
      )}
    </div>
  );
}