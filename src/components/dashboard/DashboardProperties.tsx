import { Property } from "@/utils/propertyUtils";
import { PropertyList } from "@/components/properties/PropertyList";
import { useProperties } from "@/hooks/useProperties";
import { useState } from "react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { Grid, List } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  console.log("DashboardProperties - userRole:", userRole);
  console.log("DashboardProperties - properties:", properties);
  console.log("DashboardProperties - isLoading:", isLoading);

  const handleEdit = async (property: Property, data: any) => {
    try {
      if (!property?.id) {
        console.error("No property ID provided for update");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid property data",
        });
        return false;
      }

      setIsSubmitting(true);
      console.log("Editing property with ID:", property.id);
      console.log("Update data:", data);

      // Ensure data is properly formatted before sending to Supabase
      const updateData = {
        name: data.name,
        address: data.address,
        monthly_rent: data.monthly_rent,
        type: data.type,
        description: data.description || null,
        available_from: data.available_from || null
      };

      const { error } = await supabase
        .from("properties")
        .update(updateData)
        .eq("id", property.id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

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
    if (!property?.id) {
      console.error("Invalid property data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot edit this property",
      });
      return;
    }
    console.log("Setting selected property for edit:", property);
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
      <div className="flex justify-between items-center mb-4">
        <PropertyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
        
        <div className="bg-gray-200 text-sm text-gray-500 leading-none border-2 border-gray-200 rounded-full inline-flex">
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-l-full px-4 py-2 ${
              viewMode === "grid" ? "bg-white text-blue-400" : ""
            }`}
          >
            <Grid className="w-4 h-4 mr-2" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-r-full px-4 py-2 ${
              viewMode === "list" ? "bg-white text-blue-400" : ""
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            <span>List</span>
          </button>
        </div>
      </div>

      <PropertyList
        properties={filteredProperties}
        isLoading={isLoading}
        userRole={userRole}
        onEdit={handleEditClick}
        onDelete={onDelete}
        viewMode={viewMode}
      />

      {selectedProperty && (
        <PropertyDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={(data) => handleEdit(selectedProperty, data)}
          property={selectedProperty}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      )}
    </>
  );
}