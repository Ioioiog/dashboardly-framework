import React from "react";
import { Calendar, UserMinus, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Property } from "@/utils/propertyUtils";
import { Button } from "@/components/ui/button";

interface PropertyCardLandlordSectionProps {
  property: Property;
  isDeleting: boolean;
  onDeleteTenancy: () => void;
  onAssignTenant: () => void;
}

export function PropertyCardLandlordSection({ 
  property, 
  isDeleting, 
  onDeleteTenancy, 
  onAssignTenant 
}: PropertyCardLandlordSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h4 className="font-medium text-gray-900">Current Tenant</h4>
      {property.tenancy ? (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Start Date: {format(new Date(property.tenancy.start_date), 'PPP')}
            </p>
            {property.tenancy.end_date && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                End Date: {format(new Date(property.tenancy.end_date), 'PPP')}
              </p>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteTenancy}
            disabled={isDeleting}
            className="flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            <UserMinus className="h-4 w-4" />
            {isDeleting ? "Removing..." : "Remove Tenant"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">No tenant assigned</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onAssignTenant}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Assign Tenant
          </Button>
        </div>
      )}
    </div>
  );
}