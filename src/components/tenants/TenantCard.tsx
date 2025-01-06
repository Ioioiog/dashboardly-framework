import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantDialog } from "./TenantDialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import type { Tenant } from "@/types/tenant";

interface TenantCardProps {
  tenant: Tenant;
  userRole: "landlord" | "tenant";
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export function TenantCard({ tenant, userRole, onEdit, onDelete }: TenantCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tenant.first_name} {tenant.last_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Email: {tenant.email}</p>
          {tenant.phone && (
            <p className="text-sm text-gray-500">Phone: {tenant.phone}</p>
          )}
          <p className="text-sm text-gray-500">
            Property: {tenant.property.name} - {tenant.property.address}
          </p>
          <p className="text-sm text-gray-500">
            Start Date: {new Date(tenant.tenancy.start_date).toLocaleDateString()}
          </p>
          {tenant.tenancy.end_date && (
            <p className="text-sm text-gray-500">
              End Date: {new Date(tenant.tenancy.end_date).toLocaleDateString()}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Status: {tenant.tenancy.status}
          </p>
        </div>
      </CardContent>
      {userRole === "landlord" && (
        <CardFooter className="flex justify-end gap-2">
          <TenantDialog tenant={tenant} properties={[tenant.property]}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </TenantDialog>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete?.(tenant)}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}