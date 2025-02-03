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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Tenant Information and Images */}
          <div className="space-y-8">
            <div className={cn(
              "p-6 rounded-lg border bg-white shadow-sm",
              userRole !== "tenant" && "opacity-75"
            )}>
              <h3 className="text-lg font-semibold mb-6">Request Details</h3>
              <RequestDetails
                form={form}
                properties={properties}
                userRole={userRole}
                isExistingRequest={!!existingRequest}
              />
            </div>

            <div className={cn(
              "p-6 rounded-lg border bg-white shadow-sm",
              userRole !== "tenant" && "opacity-75"
            )}>
              <h3 className="text-lg font-semibold mb-6">Supporting Images</h3>
              <ImageUpload
                images={form.watch("images")}
                onChange={(images) => form.setValue("images", images)}
                disabled={userRole === "landlord"}
              />
            </div>
          </div>

          {/* Right Column - Landlord and Service Provider Management */}
          <div className="space-y-8">
            <div className={cn(
              "p-6 rounded-lg border bg-white shadow-sm",
              userRole !== "landlord" && "opacity-75"
            )}>
              <h3 className="text-lg font-semibold mb-6">Management Details</h3>
              <LandlordFields
                formData={{
                  assigned_to: form.watch("assigned_to"),
                  service_provider_notes: form.watch("service_provider_notes"),
                  notes: form.watch("notes"),
                  status: form.watch("status")
                }}
                onChange={(field, value) => form.setValue(field as any, value)}
                serviceProviders={serviceProviders || []}
                userRole={userRole}
                isExistingRequest={!!existingRequest}
              />
            </div>

            {userRole === "service_provider" && (
              <div className="p-6 rounded-lg border bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Service Provider Details</h3>
                <div className="space-y-4">
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
            )}
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