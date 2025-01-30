import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tenant } from "@/types/tenant";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TenantListHeader } from "./TenantListHeader";
import { TenantCard } from "./TenantCard";
import { TenantRow } from "./TenantRow";
import { PendingInvitationCard } from "./PendingInvitationCard";
import { PendingInvitationRow } from "./PendingInvitationRow";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showInactive, setShowInactive] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (showInactive) {
        try {
          const { data: invitations, error } = await supabase
            .from('tenant_invitations')
            .select(`
              *,
              tenant_invitation_properties (
                property_id,
                properties:property_id (
                  id,
                  name,
                  address
                )
              )
            `)
            .eq('status', 'pending')
            .eq('used', false);

          if (error) throw error;
          console.log("Pending invitations:", invitations);
          setPendingInvitations(invitations || []);
        } catch (error) {
          console.error("Error fetching pending invitations:", error);
          toast({
            title: "Error",
            description: "Failed to fetch pending invitations",
            variant: "destructive",
          });
        }
      }
    };

    fetchPendingInvitations();
  }, [showInactive, toast]);

  const handleTenantUpdate = () => {
    console.log("Invalidating tenants query");
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      console.log("Starting deletion process for tenant:", tenantId);
      
      // Delete tenant observations
      const { error: observationsError } = await supabase
        .from('tenant_observations')
        .delete()
        .eq('tenant_id', tenantId);

      if (observationsError) {
        console.error("Error deleting observations:", observationsError);
        throw observationsError;
      }

      // Delete tenant interactions
      const { error: interactionsError } = await supabase
        .from('tenant_interactions')
        .delete()
        .eq('tenant_id', tenantId);

      if (interactionsError) {
        console.error("Error deleting interactions:", interactionsError);
        throw interactionsError;
      }

      // Get all tenancies for the tenant
      const { data: tenancies, error: tenanciesFetchError } = await supabase
        .from('tenancies')
        .select('id, status')
        .eq('tenant_id', tenantId);

      if (tenanciesFetchError) {
        console.error("Error fetching tenancies:", tenanciesFetchError);
        throw tenanciesFetchError;
      }

      // Update status to inactive for any active tenancies
      for (const tenancy of tenancies || []) {
        if (tenancy.status !== 'inactive') {
          const { error: tenancyError } = await supabase
            .from('tenancies')
            .update({ status: 'inactive' })
            .eq('id', tenancy.id);

          if (tenancyError) {
            console.error("Error updating tenancy:", tenancyError);
            throw tenancyError;
          }
        }
      }

      console.log("Successfully deleted tenant data");

      toast({
        title: "Tenant deleted",
        description: "The tenant has been successfully removed.",
      });

      // Force a refresh of the tenants data
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast({
        title: "Error",
        description: "Failed to delete tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTenantDisplayName = (tenant: Tenant) => {
    if (!tenant) return "No name provided";
    if (!tenant.first_name && !tenant.last_name) {
      return tenant.email || "No name provided";
    }
    return `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim();
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const filteredTenants = (tenants || []).filter((tenant) => {
    if (!tenant) return false;
    
    const searchString = searchTerm.toLowerCase();
    const tenantName = getTenantDisplayName(tenant).toLowerCase();
    const tenantEmail = (tenant.email || "").toLowerCase();
    const propertyName = (tenant.property?.name || "").toLowerCase();
    const propertyAddress = (tenant.property?.address || "").toLowerCase();

    const matchesSearch = 
      tenantName.includes(searchString) ||
      tenantEmail.includes(searchString) ||
      propertyName.includes(searchString) ||
      propertyAddress.includes(searchString);

    const matchesStatus = showInactive ? true : tenant.tenancy?.status === 'active';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <TenantListHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {showInactive && pendingInvitations.map((invitation) => (
            <PendingInvitationCard
              key={`invitation-${invitation.id}`}
              invitation={invitation}
            />
          ))}
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={`tenant-${tenant.id}`}
              tenant={tenant}
              onDelete={handleDeleteTenant}
              onUpdate={handleTenantUpdate}
              getTenantDisplayName={getTenantDisplayName}
              getStatusBadgeColor={getStatusBadgeColor}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Property</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showInactive && pendingInvitations.map((invitation) => (
                <PendingInvitationRow
                  key={`inv-${invitation.id}`}
                  invitation={invitation}
                />
              ))}
              {filteredTenants.map((tenant) => (
                <TenantRow
                  key={`ten-${tenant.id}`}
                  tenant={tenant}
                  onDelete={handleDeleteTenant}
                  onUpdate={handleTenantUpdate}
                  getTenantDisplayName={getTenantDisplayName}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}