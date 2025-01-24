import { Property } from "@/utils/propertyUtils";
import { PropertyList } from "@/components/properties/PropertyList";
import { useProperties } from "@/hooks/useProperties";
import { useState } from "react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { Grid, List, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardPropertiesProps {
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
}

type SortOption = "name-asc" | "name-desc" | "rent-asc" | "rent-desc" | "date-asc" | "date-desc";

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
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
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

  const sortProperties = (props: Property[]) => {
    return [...props].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rent-asc":
          return a.monthly_rent - b.monthly_rent;
        case "rent-desc":
          return b.monthly_rent - a.monthly_rent;
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedAndFilteredProperties = filteredProperties ? sortProperties(filteredProperties) : [];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <PropertyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                {sortBy.includes("asc") ? <ArrowDownAZ className="mr-2 h-4 w-4" /> : <ArrowUpAZ className="mr-2 h-4 w-4" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rent-asc")}>
                Rent (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rent-desc")}>
                Rent (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
                Date Added (Oldest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
                Date Added (Newest)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
      </div>

      <PropertyList
        properties={sortedAndFilteredProperties}
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
