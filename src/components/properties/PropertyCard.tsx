import React from "react";
import { Building2, MapPin, Edit, Trash2, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
  type: string;
  description?: string;
  available_from?: string;
}

interface PropertyCardProps {
  property: Property;
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onInviteTenant?: (property: Property) => void;
}

export function PropertyCard({ 
  property, 
  userRole, 
  onEdit, 
  onDelete,
  onInviteTenant 
}: PropertyCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium">{property.name}</h3>
        </div>
        {userRole === "landlord" && (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onInviteTenant?.(property)}
              title="Invite Tenant"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(property)}
              title="Edit Property"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(property)}
              title="Delete Property"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-start text-sm text-gray-500">
        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <span>{property.address}</span>
      </div>
      {property.description && (
        <p className="mt-2 text-sm text-gray-600">{property.description}</p>
      )}
      <div className="mt-4 pt-4 border-t">
        <div className="text-sm font-medium">
          Monthly Rent: ${property.monthly_rent.toLocaleString()}
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>Type: {property.type}</span>
          {property.available_from && (
            <span>Available from: {new Date(property.available_from).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Card>
  );
}