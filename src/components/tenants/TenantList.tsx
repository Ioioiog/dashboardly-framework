import React from "react";
import { useTenants } from "@/hooks/tenant/useTenants";
import { TenantListSkeleton } from "./TenantListSkeleton";
import { EmptyTenantState } from "./EmptyTenantState";
import { TenantDialog } from "./TenantDialog";
import { Button } from "@/components/ui/button";
import { Plus, Table2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  
  console.log("🔍 TenantList - User Role:", userRole);
  console.log("👤 TenantList - User ID:", userId);
  console.log("📊 TenantList - Fetched Data:", data);
  
  const tenants = data?.tenancies || [];
  const properties = data?.properties || [];
  const { toast } = useToast();

  // Log detailed information about each tenant and their property
  React.useEffect(() => {
    if (tenants.length > 0) {
      console.group("👥 Tenant Details:");
      tenants.forEach((tenant, index) => {
        console.log(`\nTenant ${index + 1}:`);
        console.log("ID:", tenant.id);
        console.log("Name:", tenant.first_name, tenant.last_name);
        console.log("Email:", tenant.email);
        console.log("Property Details:", tenant.property);
        console.log("Tenancy Status:", tenant.tenancy.status);
        console.log("Tenancy Dates:", {
          start: tenant.tenancy.start_date,
          end: tenant.tenancy.end_date
        });
      });
      console.groupEnd();
    }
  }, [tenants]);

  const handleDelete = async (tenant: Tenant) => {
    console.log("Delete tenant:", tenant);
    
    try {
      if (tenant.tenancy.status === 'invitation_pending') {
        const { error: invitationError } = await supabase
          .from('tenant_invitations')
          .delete()
          .eq('id', tenant.id);

        if (invitationError) throw invitationError;
      } else {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Table2 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Tenants List</h2>
        </div>
        
        {userRole === "landlord" && (
          <TenantDialog properties={properties}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </TenantDialog>
        )}
      </div>
      
      {!tenants?.length ? (
        <EmptyTenantState userRole={userRole} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                {userRole === "landlord" && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    {tenant.first_name} {tenant.last_name}
                  </TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone || "N/A"}</TableCell>
                  <TableCell>{tenant.property.name}</TableCell>
                  <TableCell>
                    {new Date(tenant.tenancy.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      tenant.tenancy.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : tenant.tenancy.status === 'invitation_pending'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {tenant.tenancy.status}
                    </span>
                  </TableCell>
                  {userRole === "landlord" && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(tenant)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(tenant)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}