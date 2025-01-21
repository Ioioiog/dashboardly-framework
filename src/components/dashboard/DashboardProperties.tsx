import { Property } from "@/utils/propertyUtils";
import { PropertyList } from "@/components/properties/PropertyList";
import { useProperties } from "@/hooks/useProperties";
import { useState } from "react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PropertyFilters } from "@/components/properties/PropertyFilters";

interface DashboardPropertiesProps {
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
}

export function DashboardProperties({ 
  userRole,
  onEdit,
  onDelete 
}: DashboardPropertiesProps) {
  const { properties, isLoading } = useProperties({ userRole });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  console.log("DashboardProperties - userRole:", userRole);
  console.log("DashboardProperties - properties:", properties);
  console.log("DashboardProperties - isLoading:", isLoading);

  const handleEdit = async (property: Property, data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Editing property:", property.id, data);

      const { error } = await supabase
        .from("properties")
        .update({
          name: data.name,
          address: data.address,
          monthly_rent: data.monthly_rent,
          type: data.type,
          description: data.description,
          available_from: data.available_from
        })
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      setShowEditDialog(false);
      window.location.reload(); // Refresh to show updated data
      return true;
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update property",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setShowEditDialog(true);
  };

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <PropertyFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      <PropertyList
        properties={filteredProperties}
        isLoading={isLoading}
        userRole={userRole}
        onEdit={handleEditClick}
        onDelete={onDelete}
      />

      {selectedProperty && (
        <PropertyDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleEdit}
          property={selectedProperty}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      )}
    </>
  );
}