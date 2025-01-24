import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { useProperties } from "@/hooks/useProperties";
import { useUserRole } from "@/hooks/use-user-role";
import { ImageUploadField } from "./form/ImageUploadField";
import { MaintenanceFormFields } from "./form/MaintenanceFormFields";
import { useMaintenanceForm } from "./form/useMaintenanceForm";
import { Card } from "@/components/ui/card";

interface MaintenanceFormProps {
  request?: MaintenanceRequest | null;
  onSuccess: () => void;
}

export function MaintenanceForm({ request, onSuccess }: MaintenanceFormProps) {
  const { toast } = useToast();
  const { userRole } = useUserRole();
  const { properties } = useProperties({ userRole });
  
  const {
    form,
    isSubmitting,
    selectedImages,
    handleImageChange,
    uploadImages,
    setIsSubmitting,
  } = useMaintenanceForm({ request, userRole, onSuccess });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const imageUrls = selectedImages.length > 0 ? await uploadImages() : [];
      
      // Combine existing images with new ones if editing
      const allImages = request?.images 
        ? [...request.images, ...imageUrls]
        : imageUrls;

      const submitData = {
        title: data.title,
        description: data.description,
        property_id: data.property_id,
        priority: data.priority,
        status: userRole === "tenant" ? "pending" : data.status,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 space-y-4">
            <h3 className="text-lg font-medium">Request Details</h3>
            <MaintenanceFormFields
              form={form}
              properties={properties}
              userRole={userRole}
            />
          </Card>
          
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Request Images</h3>
            <ImageUploadField
              onImageChange={handleImageChange}
              selectedImages={selectedImages}
              existingImages={request?.images}
            />
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting
              ? "Saving..."
              : request
              ? "Update Request"
              : "Create Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}