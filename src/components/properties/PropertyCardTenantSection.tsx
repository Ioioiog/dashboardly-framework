import React from "react";
import { Calendar, DollarSign, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Property } from "@/utils/propertyUtils";
import { Button } from "@/components/ui/button";

interface PropertyCardTenantSectionProps {
  property: Property;
  onAssignTenant: () => void;
}

export function PropertyCardTenantSection({ property, onAssignTenant }: PropertyCardTenantSectionProps) {
  // Calculate next payment date (1st of next month)
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(1);

  return (
    <div className="space-y-3 pt-4 border-t border-gray-100">
      <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>Contract Start: {format(new Date(property.available_from || new Date()), 'PPP')}</span>
        </div>
        {property.tenancy?.end_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Contract End: {format(new Date(property.tenancy.end_date), 'PPP')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4 text-blue-500" />
          <span>Next Payment Due: {format(nextPaymentDate, 'PPP')}</span>
        </div>
        {!property.tenancy && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAssignTenant}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Assign Tenant
          </Button>
        )}
      </div>
    </div>
  );
}