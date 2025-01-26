import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "@/utils/propertyUtils";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormFields } from "./MaintenanceFormFields";
import { ImageUploadField } from "./ImageUploadField";

interface FormSectionsProps {
  form: UseFormReturn<any>;
  properties: Property[];
  userRole: string;
  selectedImages: File[];
  existingImages?: string[] | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function FormSections({
  form,
  properties,
  userRole,
  selectedImages,
  existingImages,
  onImageChange,
  isSubmitting,
  isEditing,
}: FormSectionsProps) {
  return (
    <>
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
            onImageChange={onImageChange}
            selectedImages={selectedImages}
            existingImages={existingImages}
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
            : isEditing
            ? "Update Request"
            : "Create Request"}
        </Button>
      </div>
    </>
  );
}