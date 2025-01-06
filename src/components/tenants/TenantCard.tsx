import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Tenant } from "@/types/tenant";

interface TenantCardProps {
  tenant: Tenant;
  userRole: "landlord" | "tenant";
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export function TenantCard({ tenant, userRole, onEdit, onDelete }: TenantCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-2xl font-semibold mb-4">
          {tenant.first_name} {tenant.last_name}
        </h3>
        
        <div className="space-y-2 text-gray-600">
          <p>
            <span className="font-medium">Email: </span>
            {tenant.email}
          </p>
          
          {tenant.phone && (
            <p>
              <span className="font-medium">Phone: </span>
              {tenant.phone}
            </p>
          )}
          
          <p>
            <span className="font-medium">Property: </span>
            {tenant.property.name} - {tenant.property.address}
          </p>
          
          <p>
            <span className="font-medium">Start Date: </span>
            {new Date(tenant.tenancy.start_date).toLocaleDateString()}
          </p>
          
          <p>
            <span className="font-medium">Status: </span>
            {tenant.tenancy.status}
          </p>
        </div>
      </div>

      {userRole === "landlord" && (
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => onEdit?.(tenant)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => onDelete?.(tenant)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
}