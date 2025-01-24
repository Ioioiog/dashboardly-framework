import { Property } from "@/utils/propertyUtils";
import { PropertyList } from "@/components/properties/PropertyList";
import { useProperties } from "@/hooks/useProperties";
import { useState } from "react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { PropertyListHeader, SortOption } from "@/components/properties/PropertyListHeader";
import { usePropertyOperations } from "@/hooks/usePropertyOperations";

interface DashboardPropertiesProps {
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
}

export function DashboardProperties({ 
  userRole,
  onDelete 
}: DashboardPropertiesProps) {
  const { properties, isLoading } = useProperties({ userRole });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showOccupied, setShowOccupied] = useState(false);
  const { handleEdit, isSubmitting } = usePropertyOperations();

  console.log("DashboardProperties - userRole:", userRole);
  console.log("DashboardProperties - properties:", properties);
  console.log("DashboardProperties - isLoading:", isLoading);

  const handleEditClick = (property: Property) => {
    if (!property?.id || typeof property.id !== 'string') {
      console.error("Invalid property data:", property);
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
    const matchesOccupied = !showOccupied || (property.tenancy !== undefined);
    return matchesSearch && matchesType && matchesOccupied;
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
          showOccupied={showOccupied}
          setShowOccupied={setShowOccupied}
          userRole={userRole}
        />
        
        <PropertyListHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
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
