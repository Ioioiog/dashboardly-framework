import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { RequestDetails } from "./RequestDetails";
import { LandlordFields } from "./LandlordFields";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScheduleVisitField } from "./ScheduleVisitField";

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
  notes?: string;
  assigned_to?: string;
  service_provider_notes?: string;
  images: (string | File)[];
  tenant_id: string;
  scheduled_date?: Date;
  service_provider_fee?: number;
  service_provider_status?: string;
  completion_report?: string;
}

interface MaintenanceRequestFormProps {
  properties: Property[];
  serviceProviders?: Array<{ id: string; first_name: string; last_name: string; }>;
  userRole: string;
  existingRequest?: MaintenanceFormValues;
  onSubmit: (values: MaintenanceFormValues) => void;
  isSubmitting?: boolean;
  isLoadingProviders?: boolean;
}

export function MaintenanceRequestForm({
  properties,
  serviceProviders,
  userRole,
  existingRequest,
  onSubmit,
  isSubmitting,
  isLoadingProviders = false
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
      tenant_id: "",
      scheduled_date: undefined,
      service_provider_fee: 0,
      service_provider_status: "",
      completion_report: ""
    }
  });

  const handleSubmit = (data: MaintenanceFormValues) => {
    console.log("Form submitted with data:", data);
    onSubmit(data);
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log("Date selected in form:", date);
    form.setValue("scheduled_date", date, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tenant Column */}
          <div className={cn(
            "space-y-4 p-6 rounded-lg border bg-white",
            (userRole === "service_provider" || userRole === "landlord") && "opacity-75"
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
              disabled={userRole !== "tenant"}
            />
          </div>

          {/* Landlord Column */}
          <div className={cn(
            "space-y-4 p-6 rounded-lg border bg-white",
            userRole !== "landlord" && "opacity-75"
          )}>
            <h3 className="text-lg font-semibold mb-4">Landlord Management</h3>
            <LandlordFields
              formData={{
                assigned_to: form.watch("assigned_to"),
                service_provider_notes: form.watch("service_provider_notes"),
                notes: form.watch("notes"),
                status: form.watch("status")
              }}
              onFieldChange={(field, value) => form.setValue(field as keyof MaintenanceFormValues, value)}
              serviceProviders={serviceProviders || []}
              isLoadingProviders={isLoadingProviders}
            />
          </div>

          {/* Service Provider Column */}
          <div className={cn(
            "space-y-4 p-6 rounded-lg border bg-white",
            !form.watch("assigned_to") && userRole === "service_provider" && "opacity-75"
          )}>
            <h3 className="text-lg font-semibold mb-4">Service Provider Details</h3>
            <div className="space-y-4">
              <ScheduleVisitField
                value={form.watch("scheduled_date")}
                onChange={handleDateSelect}
                disabled={!form.watch("assigned_to")}
              />

              {/* Initial Cost Estimate */}
              <div className="space-y-2">
                <Label>Service Fee Estimate ($)</Label>
                <Input
                  type="number"
                  value={form.watch("service_provider_fee") || ""}
                  onChange={(e) => form.setValue("service_provider_fee", parseFloat(e.target.value))}
                  placeholder="Enter estimated cost"
                  disabled={!form.watch("assigned_to")}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Service Provider Status */}
              <div className="space-y-2">
                <Label>Service Status</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={form.watch("service_provider_status") || ""}
                  onChange={(e) => form.setValue("service_provider_status", e.target.value)}
                  disabled={!form.watch("assigned_to")}
                >
                  <option value="">Select status</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Completion Report */}
              <div className="space-y-2">
                <Label>Completion Report</Label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={form.watch("completion_report") || ""}
                  onChange={(e) => form.setValue("completion_report", e.target.value)}
                  placeholder="Enter completion details, repairs made, and recommendations"
                  disabled={!form.watch("assigned_to")}
                  rows={4}
                />
              </div>

              {form.watch("service_provider_notes") && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Instructions from Landlord</h4>
                  <p className="text-sm">{form.watch("service_provider_notes")}</p>
                </div>
              )}
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
