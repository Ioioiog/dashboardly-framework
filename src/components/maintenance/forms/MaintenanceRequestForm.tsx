import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { RequestDetails } from "./RequestDetails";
import { LandlordFields } from "./LandlordFields";

interface Property {
  id: string;
  name: string;
}

export interface MaintenanceFormValues {
  title: string;
  description: string;
  property_id: string;
  priority: string;
  status: string;
  notes: string;
  assigned_to: string;
  service_provider_notes: string;
  images: (string | File)[];
  tenant_id: string;
}

interface MaintenanceRequestFormProps {
  defaultValues: MaintenanceFormValues;
  onSubmit: (values: MaintenanceFormValues) => void;
  properties: Property[];
  userRole: string;
  serviceProviders?: Array<{ id: string; first_name: string; last_name: string; }>;
}

export function MaintenanceRequestForm({
  defaultValues,
  onSubmit,
  properties,
  userRole,
  serviceProviders,
}: MaintenanceRequestFormProps) {
  const form = useForm<MaintenanceFormValues>({ defaultValues });
  const isExistingRequest = defaultValues.title !== "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Request Details */}
          <div className="space-y-4">
            <RequestDetails
              form={form}
              properties={properties}
              userRole={userRole}
              isExistingRequest={isExistingRequest}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <ImageUpload
                  images={field.value}
                  onChange={field.onChange}
                  disabled={userRole === "landlord"}
                />
              )}
            />
          </div>

          {/* Right Column - Landlord Fields */}
          <div className="space-y-4">
            <LandlordFields
              form={form}
              serviceProviders={serviceProviders}
              userRole={userRole}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">
            {isExistingRequest ? "Update Request" : "Create Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}