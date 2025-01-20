import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus, Calendar, DollarSign, UserMinus } from "lucide-react";
import { Property } from "@/utils/propertyUtils";
import { TenantAssignDialog } from "./TenantAssignDialog";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PropertyCardProps {
  property: Property;
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyCard({ property, userRole, onEdit, onDelete }: PropertyCardProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  console.log("Property data:", property);

  // Calculate next payment date (1st of next month)
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(1);

  const handleDeleteTenancy = async () => {
    try {
      setIsDeleting(true);
      console.log("Deleting tenancy for property:", property.id);
      
      const { error } = await supabase
        .from('tenancies')
        .update({ status: 'inactive', end_date: new Date().toISOString() })
        .eq('property_id', property.id)
        .eq('status', 'active');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant has been removed from the property",
      });

      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting tenancy:', error);
      toast({
        title: "Error",
        description: "Failed to remove tenant from property",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("User role:", userRole);
  console.log("Tenancy info:", property.tenancy);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{property.name}</h3>
              <p className="text-gray-500">{property.address}</p>
              <p className="text-lg font-medium">
                ${property.monthly_rent}/{t('properties.rent.period')}
              </p>
              {property.type && (
                <p className="text-sm text-gray-500">{t('properties.type')}: {property.type}</p>
              )}
              {property.description && (
                <p className="text-sm text-gray-500">{property.description}</p>
              )}
            </div>

            {userRole === "tenant" && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Contract Start: {format(new Date(property.available_from || new Date()), 'PPP')}</span>
                </div>
                {property.tenancy?.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Contract End: {format(new Date(property.tenancy.end_date), 'PPP')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Next Payment Due: {format(nextPaymentDate, 'PPP')}</span>
                </div>
              </div>
            )}

            {userRole === "landlord" && property.tenancy && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Current Tenant</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Start Date: {format(new Date(property.tenancy.start_date), 'PPP')}
                    </p>
                    {property.tenancy.end_date && (
                      <p className="text-sm text-gray-600">
                        End Date: {format(new Date(property.tenancy.end_date), 'PPP')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteTenancy}
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    <UserMinus className="h-4 w-4" />
                    {isDeleting ? "Removing..." : "Remove Tenant"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        {userRole === "landlord" && (
          <CardFooter className="px-6 py-4 bg-gray-50 gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(property, {})}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(property)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignDialog(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {t('properties.assign_tenant')}
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