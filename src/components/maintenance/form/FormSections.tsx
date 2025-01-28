import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "@/utils/propertyUtils";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormFields } from "./MaintenanceFormFields";
import { ImageUploadField } from "./ImageUploadField";
import { useTranslation } from "react-i18next";

interface FormSectionsProps {
  form: UseFormReturn<any>;
  properties: Property[];
  userRole: string;
  selectedImages: File[];
  existingImages?: string[] | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  section: "tenant" | "landlord";
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
  section,
}: FormSectionsProps) {
  const { t } = useTranslation();

  const showTenantFields = section === "tenant";
  const showLandlordFields = section === "landlord" && userRole === "landlord";

  if (!showTenantFields && !showLandlordFields) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <MaintenanceFormFields
          form={form}
          properties={properties}
          userRole={userRole}
          section={section}
        />
        
        {showTenantFields && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">{t('maintenance.form.requestImages')}</h3>
            <ImageUploadField
              onImageChange={onImageChange}
              selectedImages={selectedImages}
              existingImages={existingImages}
            />
          </Card>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[150px]"
        >
          {isSubmitting
            ? t('common.saving')
            : isEditing
            ? t('maintenance.form.updateRequest')
            : t('maintenance.form.createRequest')}
        </Button>
      </div>
    </>
  );
}