import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/utils/propertyUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UtilityStatsDialog } from "./UtilityStatsDialog";
import { TenantAssignDialog } from "@/components/tenants/TenantAssignDialog";
import { PropertyCardHeader } from "./PropertyCardHeader";
import { PropertyCardTenantSection } from "./PropertyCardTenantSection";
import { PropertyCardLandlordSection } from "./PropertyCardLandlordSection";
import { PropertyCardFooter } from "./PropertyCardFooter";

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
  const [showAssignTenant, setShowAssignTenant] = useState(false);
  const { toast } = useToast();

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
    ? "flex flex-row items-start gap-6 hover:shadow-lg transition-all duration-300 animate-fade-in bg-white" 
    : "hover:shadow-lg transition-all duration-300 animate-fade-in bg-white";

  const contentClassName = viewMode === "list" ? "flex-1" : "";

  return (
    <>
      <Card className={cardClassName}>
        <CardContent className={`p-6 ${contentClassName}`}>
          <PropertyCardHeader property={property} />
          
          {userRole === "tenant" ? (
            <PropertyCardTenantSection 
              property={property}
              onAssignTenant={() => setShowAssignTenant(true)}
            />
          ) : (
            <PropertyCardLandlordSection 
              property={property}
              isDeleting={isDeleting}
              onDeleteTenancy={handleDeleteTenancy}
              onAssignTenant={() => setShowAssignTenant(true)}
            />
          )}
        </CardContent>

        <PropertyCardFooter 
          property={property}
          userRole={userRole}
          viewMode={viewMode}
          onShowUtilityStats={() => setShowUtilityStats(true)}
          onEdit={() => onEdit?.(property, {})}
          onDelete={() => onDelete?.(property)}
        />
      </Card>

      <UtilityStatsDialog
        open={showUtilityStats}
        onOpenChange={setShowUtilityStats}
        propertyId={property.id}
        propertyName={property.name}
      />

      {showAssignTenant && (
        <TenantAssignDialog
          open={showAssignTenant}
          onOpenChange={setShowAssignTenant}
          properties={[property]}
          onClose={() => setShowAssignTenant(false)}
        />
      )}
    </>
  );
}