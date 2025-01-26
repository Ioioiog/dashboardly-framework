import { Form } from "@/components/ui/form";
import { MaintenanceRequest } from "@/types/maintenance";
import { useProperties } from "@/hooks/useProperties";
import { useUserRole } from "@/hooks/use-user-role";
import { useMaintenanceForm } from "./form/useMaintenanceForm";
import { useMaintenanceSubmit } from "./form/useMaintenanceSubmit";
import { FormSections } from "./form/FormSections";

interface MaintenanceFormProps {
  request?: MaintenanceRequest | null;
  onSuccess: () => void;
}

export function MaintenanceForm({ request, onSuccess }: MaintenanceFormProps) {
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

  const { handleSubmit: submitRequest } = useMaintenanceSubmit({ 
    request, 
    onSuccess 
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const imageUrls = selectedImages.length > 0 ? await uploadImages() : [];
      await submitRequest(data, imageUrls);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSections
          form={form}
          properties={properties}
          userRole={userRole}
          selectedImages={selectedImages}
          existingImages={request?.images}
          onImageChange={handleImageChange}
          isSubmitting={isSubmitting}
          isEditing={!!request}
        />
      </form>
    </Form>
  );
}