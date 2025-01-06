import React from "react";
import { TenantCard } from "./TenantCard";
import { TenantListSkeleton } from "./TenantListSkeleton";
import { EmptyTenantState } from "./EmptyTenantState";
import { useTenants } from "@/hooks/useTenants";
import { TenantDialog } from "./TenantDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  userId 
}: TenantListProps) {
  const { data, isLoading: isLoadingQuery, refetch } = useTenants(userId, userRole);
  const isLoading = isLoadingProp || isLoadingQuery;
  const tenants = data?.tenancies || [];
  const properties = data?.properties || [];
  const { toast } = useToast();

  const handleDelete = async (tenant: Tenant) => {
    console.log("Delete tenant:", tenant);
    
    try {
      if (tenant.tenancy.status === 'invitation_pending') {
        // Delete invitation
        const { error: invitationError } = await supabase
          .from('tenant_invitations')
          .delete()
          .eq('id', tenant.id);

        if (invitationError) throw invitationError;
      } else {
        // Update tenancy status to inactive
        const { error: tenancyError } = await supabase
          .from('tenancies')
          .update({ status: 'inactive' })
          .eq('tenant_id', tenant.id);

        if (tenancyError) throw tenancyError;
      }

      toast({
        title: "Success",
        description: "Tenant removed successfully",
      });

      // Refresh the tenants list
      refetch();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast({
        title: "Error",
        description: "Failed to remove tenant",
        variant: "destructive",
      });
    }
  };

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
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}