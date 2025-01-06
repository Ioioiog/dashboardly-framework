import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TenantDialog } from "./TenantDialog";
import { format } from "date-fns";

async function fetchTenants(userId: string) {
  console.log("Fetching tenants for landlord:", userId);
  
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("landlord_id", userId);

  if (propertiesError) {
    console.error("Error fetching properties:", propertiesError);
    throw propertiesError;
  }

  // First get all properties owned by the landlord
  const propertyIds = properties.map(p => p.id);
  
  // Then get all tenancies for these properties, including tenant profiles
  const { data: tenancies, error: tenanciesError } = await supabase
    .from("tenancies")
    .select(`
      id,
      property_id,
      start_date,
      end_date,
      status,
      tenant:tenant_id (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      property:property_id (
        id,
        name,
        address
      )
    `)
    .in('property_id', propertyIds);

  if (tenanciesError) {
    console.error("Error fetching tenancies:", tenanciesError);
    throw tenanciesError;
  }

  console.log("Fetched tenants:", tenancies);
  return { 
    tenancies: tenancies.map(({ tenant, property, ...tenancy }) => ({
      id: tenant?.id,
      first_name: tenant?.first_name,
      last_name: tenant?.last_name,
      email: tenant?.email,
      phone: tenant?.phone,
      property: property || { id: '', name: '', address: '' },
      tenancy: {
        start_date: tenancy.start_date,
        end_date: tenancy.end_date,
        status: tenancy.status
      }
    })),
    properties 
  };
}

interface TenantListProps {
  userId: string;
}

export function TenantList({ userId }: TenantListProps) {
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", userId],
    queryFn: () => fetchTenants(userId),
  });

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      const { error: tenancyError } = await supabase
        .from("tenancies")
        .update({ status: "inactive" })
        .eq("tenant_id", tenantId);

      if (tenancyError) throw tenancyError;

      toast({
        title: "Success",
        description: "Tenant removed successfully",
      });
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast({
        title: "Error",
        description: "Failed to remove tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  const filteredTenants = data?.tenancies.filter((tenant) => {
    const matchesSearch = 
      tenant.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      tenant.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(search.toLowerCase()) ||
      tenant.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesProperty = propertyFilter === "all" || tenant.property.id === propertyFilter;
    const matchesStatus = statusFilter === "all" || tenant.tenancy.status === statusFilter;

    return matchesSearch && matchesProperty && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {data?.properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1 text-right">
          <TenantDialog properties={data?.properties || []} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Lease Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants?.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  {tenant.first_name} {tenant.last_name}
                </TableCell>
                <TableCell>
                  <div>{tenant.email}</div>
                  <div className="text-sm text-muted-foreground">{tenant.phone}</div>
                </TableCell>
                <TableCell>
                  <div>{tenant.property.name}</div>
                  <div className="text-sm text-muted-foreground">{tenant.property.address}</div>
                </TableCell>
                <TableCell>
                  <div>{format(new Date(tenant.tenancy.start_date), "PP")}</div>
                  {tenant.tenancy.end_date && (
                    <div className="text-sm text-muted-foreground">
                      to {format(new Date(tenant.tenancy.end_date), "PP")}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    tenant.tenancy.status === "active" 
                      ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                      : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10"
                  }`}>
                    {tenant.tenancy.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TenantDialog
                      properties={data?.properties || []}
                      tenant={{
                        id: tenant.id,
                        email: tenant.email || "",
                        first_name: tenant.first_name || "",
                        last_name: tenant.last_name || "",
                        phone: tenant.phone,
                        tenancy: {
                          property_id: tenant.property.id,
                          start_date: tenant.tenancy.start_date,
                          end_date: tenant.tenancy.end_date,
                        },
                      }}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will mark the tenant as inactive. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTenant(tenant.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredTenants?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No tenants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}