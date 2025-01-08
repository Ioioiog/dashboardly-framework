import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const { toast } = useToast();

  const handleEdit = async (tenant: Tenant) => {
    try {
      console.log("Updating tenant:", tenant.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone,
        })
        .eq('id', tenant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant information updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating tenant:", error);
      toast({
        title: "Error",
        description: "Failed to update tenant information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>
                {tenant.first_name} {tenant.last_name}
              </TableCell>
              <TableCell>
                <div>{tenant.email}</div>
                <div className="text-sm text-gray-500">{tenant.phone}</div>
              </TableCell>
              <TableCell>
                <div>{tenant.property.name}</div>
                <div className="text-sm text-gray-500">
                  {tenant.property.address}
                </div>
              </TableCell>
              <TableCell>
                {new Date(tenant.tenancy.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {tenant.tenancy.end_date
                  ? new Date(tenant.tenancy.end_date).toLocaleDateString()
                  : "No end date"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tenant.tenancy.status === "active" ? "default" : "secondary"
                  }
                >
                  {tenant.tenancy.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(tenant)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}