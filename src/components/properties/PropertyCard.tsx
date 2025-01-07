import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { Property } from "@/utils/propertyUtils";
import { TenantAssignDialog } from "./TenantAssignDialog";

interface PropertyCardProps {
  property: Property;
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyCard({ property, userRole, onEdit, onDelete }: PropertyCardProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{property.name}</h3>
            <p className="text-gray-500">{property.address}</p>
            <p className="text-lg font-medium">
              ${property.monthly_rent}/month
            </p>
            {property.type && (
              <p className="text-sm text-gray-500">Type: {property.type}</p>
            )}
            {property.description && (
              <p className="text-sm text-gray-500">{property.description}</p>
            )}
            {property.available_from && (
              <p className="text-sm text-gray-500">
                Available from: {new Date(property.available_from).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
        {userRole === "landlord" && (
          <CardFooter className="px-6 py-4 bg-gray-50 gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(property)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(property)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignDialog(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign Tenant
            </Button>
          </CardFooter>
        )}
      </Card>

      <TenantAssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        propertyId={property.id}
        propertyName={property.name}
      />
    </>
  );
}