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
import { Trash2, LayoutGrid, List } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { toast } = useToast();
  
  const handleTenantUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      console.log("Deleting tenant:", tenantId);
      
      await supabase
        .from('tenant_observations')
        .delete()
        .eq('tenant_id', tenantId);

      await supabase
        .from('tenant_interactions')
        .delete()
        .eq('tenant_id', tenantId);

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

    return (
      tenantName.includes(searchString) ||
      tenantEmail.includes(searchString) ||
      propertyName.includes(searchString) ||
      propertyAddress.includes(searchString)
    );
  });

  if (!Array.isArray(tenants) || tenants.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow p-8 text-center">
        <p className="text-muted-foreground">No tenants found</p>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTenants.map((tenant) => {
        if (!tenant || !tenant.property) return null;
        
        return (
          <Card key={`${tenant.id}-${tenant.property.id}-${tenant.tenancy.start_date}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="font-semibold">{getTenantDisplayName(tenant)}</h3>
              {tenant.tenancy && (
                <Badge className={getStatusBadgeColor(tenant.tenancy.status)}>
                  {tenant.tenancy.status}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{tenant.email || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{tenant.phone || "N/A"}</p>
                <p className="text-sm">{tenant.property.name} ({tenant.property.address})</p>
                <div className="text-sm">
                  <p>Start: {tenant.tenancy?.start_date ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy") : "N/A"}</p>
                  <p>End: {tenant.tenancy?.end_date ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy") : "Ongoing"}</p>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
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
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = () => (
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
            if (!tenant || !tenant.property) return null;
            
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
                    {tenant.tenancy?.start_date
                      ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {tenant.tenancy?.end_date
                      ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy")
                      : "Ongoing"}
                  </TableCell>
                  <TableCell>
                    {tenant.tenancy && (
                      <Badge className={getStatusBadgeColor(tenant.tenancy.status)}>
                        {tenant.tenancy.status}
                      </Badge>
                    )}
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
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Tenants</Label>
          <Input
            id="search"
            placeholder="Search by name, email, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="bg-gray-200 text-sm text-gray-500 leading-none border-2 border-gray-200 rounded-full inline-flex">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-l-full px-4 py-2",
              viewMode === "grid" ? "bg-white text-blue-400" : ""
            )}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-r-full px-4 py-2",
              viewMode === "list" ? "bg-white text-blue-400" : ""
            )}
          >
            <List className="w-4 h-4 mr-2" />
            <span>List</span>
          </button>
        </div>
      </div>
      {viewMode === "grid" ? renderGridView() : renderListView()}
    </div>
  );
}