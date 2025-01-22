import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTenantDialog } from "./EditTenantDialog";
import { TenantObservationDialog } from "./TenantObservationDialog";
import { TenantInteractionHistory } from "./TenantInteractionHistory";
import { Tenant } from "@/types/tenant";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  console.log("Rendering TenantList with tenants:", tenants);

  const handleTenantUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      console.log("Deleting tenant:", tenantId);
      
      // Delete related records first
      await supabase
        .from('tenant_observations')
        .delete()
        .eq('tenant_id', tenantId);

      await supabase
        .from('tenant_interactions')
        .delete()
        .eq('tenant_id', tenantId);

      // Update tenancy status to inactive
      const { error: tenancyError } = await supabase
        .from('tenancies')
        .update({ status: 'inactive' })
        .eq('tenant_id', tenantId);

      if (tenancyError) {
        console.error("Error updating tenancy:", tenancyError);
        throw tenancyError;
      }

      toast({
        title: "Tenant deleted",
        description: "The tenant has been successfully removed.",
      });

      // Refresh the tenants list
      handleTenantUpdate();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast({
        title: "Error",
        description: "Failed to delete tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTenantDisplayName = (tenant: Tenant) => {
    if (!tenant.first_name && !tenant.last_name) {
      return tenant.email || "No name provided";
    }
    return `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim();
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const filteredTenants = tenants.filter((tenant) => {
    const searchString = searchTerm.toLowerCase();
    const tenantName = getTenantDisplayName(tenant).toLowerCase();
    const tenantEmail = (tenant.email || "").toLowerCase();
    const propertyName = (tenant.property.name || "").toLowerCase();
    const propertyAddress = (tenant.property.address || "").toLowerCase();

    return (
      tenantName.includes(searchString) ||
      tenantEmail.includes(searchString) ||
      propertyName.includes(searchString) ||
      propertyAddress.includes(searchString)
    );
  });

  if (!tenants.length) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow p-8 text-center">
        <p className="text-muted-foreground">No tenants found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Label htmlFor="search">Search Tenants</Label>
        <Input
          id="search"
          placeholder="Search by name, email, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.map((tenant) => {
              console.log("Tenant data:", tenant);
              return (
                <React.Fragment key={`${tenant.id}-${tenant.property.id}-${tenant.tenancy.start_date}`}>
                  <TableRow>
                    <TableCell>{getTenantDisplayName(tenant)}</TableCell>
                    <TableCell>{tenant.email || "N/A"}</TableCell>
                    <TableCell>{tenant.phone || "N/A"}</TableCell>
                    <TableCell>
                      {tenant.property.name} ({tenant.property.address})
                    </TableCell>
                    <TableCell>
                      {tenant.tenancy.start_date
                        ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {tenant.tenancy.end_date
                        ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy")
                        : "Ongoing"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(tenant.tenancy.status)}>
                        {tenant.tenancy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <TenantObservationDialog
                        tenantId={tenant.id}
                        tenantName={getTenantDisplayName(tenant)}
                      />
                      <EditTenantDialog tenant={tenant} onUpdate={handleTenantUpdate} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this tenant? This action will remove all tenant observations and interactions, and mark their tenancy as inactive.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTenant(tenant.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={8} className="bg-gray-50">
                      <TenantInteractionHistory tenantId={tenant.id} />
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}