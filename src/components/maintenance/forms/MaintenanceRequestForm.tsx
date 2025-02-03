import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { RequestDetails } from "./RequestDetails";
import { LandlordFields } from "./LandlordFields";
import { cn } from "@/lib/utils";

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
  properties: Property[];
  serviceProviders?: Array<{ id: string; first_name: string; last_name: string; }>;
  userRole: string;
  existingRequest?: MaintenanceFormValues;
  onSubmit: (values: MaintenanceFormValues) => void;
  isSubmitting?: boolean;
}

export function MaintenanceRequestForm({
  properties,
  serviceProviders,
  userRole,
  existingRequest,
  onSubmit,
  isSubmitting
}: MaintenanceRequestFormProps) {
  const form = useForm<MaintenanceFormValues>({
    defaultValues: existingRequest || {
      title: "",
      description: "",
      property_id: "",
      priority: "low",
      status: "pending",
      notes: "",
      assigned_to: "",
      service_provider_notes: "",
      images: [],
      tenant_id: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tenant Column */}
          <div className={cn(
            "space-y-4 p-4 rounded-lg border bg-white",
            userRole !== "tenant" && "opacity-75"
          )}>
            <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
            <RequestDetails
              form={form}
              properties={properties}
              userRole={userRole}
              isExistingRequest={!!existingRequest}
            />
            <ImageUpload
              images={form.watch("images")}
              onChange={(images) => form.setValue("images", images)}
              disabled={userRole === "landlord"}
            />
          </div>

          {/* Landlord Column */}
          <div className={cn(
            "space-y-4 p-4 rounded-lg border bg-white",
            userRole !== "landlord" && "opacity-75"
          )}>
            <h3 className="text-lg font-semibold mb-4">Landlord Management</h3>
            <LandlordFields
              formData={{
                assigned_to: form.watch("assigned_to"),
                service_provider_notes: form.watch("service_provider_notes"),
                notes: form.watch("notes")
              }}
              onChange={(field, value) => form.setValue(field as any, value)}
              serviceProviders={serviceProviders || []}
              userRole={userRole}
            />
          </div>

          {/* Service Provider Column */}
          <div className={cn(
            "space-y-4 p-4 rounded-lg border bg-white",
            userRole !== "service_provider" && "opacity-75"
          )}>
            <h3 className="text-lg font-semibold mb-4">Service Provider Details</h3>
            <div className="space-y-4">
              {/* We'll show service provider specific information here */}
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {form.watch("assigned_to") 
                    ? "You have been assigned to this maintenance request"
                    : "No service provider assigned yet"}
                </p>
                {form.watch("service_provider_notes") && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Instructions</h4>
                    <p className="text-sm">{form.watch("service_provider_notes")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {existingRequest ? "Update Request" : "Create Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}