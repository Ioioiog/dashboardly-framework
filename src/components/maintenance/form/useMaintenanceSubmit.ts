import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseMaintenanceSubmitProps {
  request?: any;
  onSuccess: () => void;
}

export function useMaintenanceSubmit({ request, onSuccess }: UseMaintenanceSubmitProps) {
  const { toast } = useToast();

  const handleSubmit = async (data: any, imageUrls: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Combine existing images with new ones if editing
      const allImages = request?.images 
        ? [...request.images, ...imageUrls]
        : imageUrls;

      const submitData = {
        title: data.title,
        description: data.description,
        property_id: data.property_id,
        priority: data.priority,
        status: data.status,
        notes: data.notes || null,
        assigned_to: data.assigned_to,
        tenant_id: user.id,
        images: allImages,
      };

      console.log('Submitting maintenance request:', submitData);
      
      if (request) {
        const { error } = await supabase
          .from("maintenance_requests")
          .update(submitData)
          .eq("id", request.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Maintenance request updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("maintenance_requests")
          .insert([submitData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Maintenance request created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting maintenance request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    }
  };

  return { handleSubmit };
}