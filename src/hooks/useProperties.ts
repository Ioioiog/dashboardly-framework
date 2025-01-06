import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchLandlordProperties, 
  fetchTenantProperties, 
  Property,
  addProperty,
  updateProperty,
  deleteProperty,
} from "@/utils/propertyUtils";

interface UsePropertiesProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function useProperties({ userId, userRole }: UsePropertiesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["dashboard-properties", userId, userRole],
    queryFn: () => userRole === "landlord" 
      ? fetchLandlordProperties(userId)
      : fetchTenantProperties(userId),
  });

  const handleAdd = async (data: Omit<Property, "id">) => {
    try {
      setIsSubmitting(true);
      await addProperty({ ...data, landlord_id: userId });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-properties"] });
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      return true;
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (property: Property, data: Partial<Property>) => {
    try {
      setIsSubmitting(true);
      await updateProperty(property.id, data);
      await queryClient.invalidateQueries({ queryKey: ["dashboard-properties"] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (property: Property) => {
    try {
      setIsSubmitting(true);
      await deleteProperty(property.id);
      await queryClient.invalidateQueries({ queryKey: ["dashboard-properties"] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    properties,
    isLoading,
    isSubmitting,
    handleAdd,
    handleEdit,
    handleDelete,
  };
}