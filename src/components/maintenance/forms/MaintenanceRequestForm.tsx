import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
  contact_phone?: string;
  preferred_times?: string[];
  is_emergency?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_instructions?: string;
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
      priority: "medium",
      status: "pending",
      images: [],
      tenant_id: "",
      contact_phone: "",
      preferred_times: [],
      is_emergency: false
    }
  });

  const isEmergency = form.watch("is_emergency");

  const handleSubmit = (data: MaintenanceFormValues) => {
    console.log("Form submitted with data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-semibold">
              Issue Title<span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              {...form.register("title")}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="property_id" className="text-base font-semibold">
              Property Address<span className="text-red-500">*</span>
            </Label>
            <select
              id="property_id"
              {...form.register("property_id")}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="">Select property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-semibold">
              Detailed Description<span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible about the issue"
              {...form.register("description")}
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="contact_phone" className="text-base font-semibold">
              Contact Phone<span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact_phone"
              type="tel"
              placeholder="Your contact phone number"
              {...form.register("contact_phone")}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-base font-semibold">
              Priority Level<span className="text-red-500">*</span>
            </Label>
            <select
              id="priority"
              {...form.register("priority")}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="low">Low - Can be addressed anytime</option>
              <option value="medium">Medium - Should be addressed within 2-3 days</option>
              <option value="high">High - Requires immediate attention</option>
            </select>
          </div>

          <div>
            <Label htmlFor="is_emergency" className="flex items-center space-x-2">
              <Checkbox
                id="is_emergency"
                checked={isEmergency}
                onCheckedChange={(checked) => 
                  form.setValue("is_emergency", checked as boolean)
                }
              />
              <span className="text-base font-semibold">Mark as Emergency</span>
            </Label>
          </div>

          {isEmergency && (
            <div className="space-y-4 border-l-2 border-red-500 pl-4">
              <div>
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  {...form.register("emergency_contact_name")}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  {...form.register("emergency_contact_phone")}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="emergency_instructions">Emergency Instructions</Label>
                <Textarea
                  id="emergency_instructions"
                  {...form.register("emergency_instructions")}
                  placeholder="Any specific instructions for emergency handling..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-base font-semibold">
              Preferred Service Times
            </Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  {...form.register("preferred_times")}
                  value="morning"
                />
                <span>Morning</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  {...form.register("preferred_times")}
                  value="afternoon"
                />
                <span>Afternoon</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  {...form.register("preferred_times")}
                  value="evening"
                />
                <span>Evening</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">
              Upload Images <span className="text-gray-500 text-sm">(Optional - Max 5MB per image)</span>
            </Label>
            <ImageUpload
              images={form.watch("images")}
              onChange={(images) => form.setValue("images", images)}
              disabled={userRole !== "tenant"}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {existingRequest ? "Update Request" : "Create Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}