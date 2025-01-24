import { useState } from "react";
import { Property } from "@/utils/propertyUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePropertyOperations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEdit = async (property: Property, data: any) => {
    try {
      if (!property?.id || typeof property.id !== 'string') {
        console.error("Invalid property ID:", property?.id);
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

      window.location.reload();
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

  return {
    handleEdit,
    isSubmitting
  };
}