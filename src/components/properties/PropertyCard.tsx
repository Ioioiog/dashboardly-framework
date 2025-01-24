import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, DollarSign, UserMinus, BarChart2 } from "lucide-react";
import { Property } from "@/utils/propertyUtils";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UtilityStatsDialog } from "./UtilityStatsDialog";

interface PropertyCardProps {
  property: Property;
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
  viewMode?: "grid" | "list";
}

export function PropertyCard({ 
  property, 
  userRole, 
  onEdit, 
  onDelete,
  viewMode = "grid" 
}: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUtilityStats, setShowUtilityStats] = useState(false);
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

  const cardClassName = viewMode === "list" 
    ? "flex flex-row items-start gap-6 hover:shadow-lg transition-all duration-300 animate-fade-in" 
    : "hover:shadow-lg transition-all duration-300 animate-fade-in";

  const contentClassName = viewMode === "list"
    ? "flex-1"
    : "";

  return (
    <>
      <Card className={cardClassName}>
        <CardContent className={`p-6 ${contentClassName} space-y-6`}>
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                {property.name}
              </h3>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {property.address}
              </p>
              <p className="text-lg font-medium flex items-center gap-2 text-emerald-600">
                <DollarSign className="h-5 w-5" />
                ${property.monthly_rent}/{t('properties.rent.period')}
              </p>
              {property.type && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-full px-4 py-1 inline-block">
                  {t('properties.type')}: {property.type}
                </p>
              )}
              {property.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              )}
            </div>

            {userRole === "tenant" && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Contract Start: {format(new Date(property.available_from || new Date()), 'PPP')}</span>
                </div>
                {property.tenancy?.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>Contract End: {format(new Date(property.tenancy.end_date), 'PPP')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  <DollarSign className="h-4 w-4" />
                  <span>Next Payment Due: {format(nextPaymentDate, 'PPP')}</span>
                </div>
              </div>
            )}

            {userRole === "landlord" && property.tenancy && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-800">Current Tenant</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date: {format(new Date(property.tenancy.start_date), 'PPP')}
                    </p>
                    {property.tenancy.end_date && (
                      <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        End Date: {format(new Date(property.tenancy.end_date), 'PPP')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteTenancy}
                    disabled={isDeleting}
                    className="flex items-center gap-2 hover:bg-red-600 transition-colors"
                  >
                    <UserMinus className="h-4 w-4" />
                    {isDeleting ? "Removing..." : "Remove Tenant"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className={`px-6 py-4 bg-gray-50 gap-2 flex-wrap ${viewMode === "list" ? "border-l" : "rounded-b-lg"}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUtilityStats(true)}
            className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <BarChart2 className="h-4 w-4" />
            Analyze Invoice History
          </Button>
          {userRole === "landlord" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(property, {})}
                className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(property)}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <UtilityStatsDialog
        open={showUtilityStats}
        onOpenChange={setShowUtilityStats}
        propertyId={property.id}
        propertyName={property.name}
      />
    </>
  );
}