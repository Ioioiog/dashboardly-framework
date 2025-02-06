import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogTitle } from "@/components/ui/dialog";
import type { MaintenanceRequest } from "../hooks/useMaintenanceRequest";

interface MaintenanceDetailsTabProps {
  request?: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
  isNew?: boolean;
  properties: Array<{ id: string; name: string }>;
  userRole: 'tenant' | 'landlord' | 'service_provider';
}

export function MaintenanceDetailsTab({
  request,
  onUpdateRequest,
  isNew = false,
  properties,
  userRole
}: MaintenanceDetailsTabProps) {
  console.log("MaintenanceDetailsTab - Initializing with request:", request);

  const form = useForm<MaintenanceRequest>({
    defaultValues: {
      title: "",
      description: "",
      property_id: "",
      issue_type: "",
      priority: "low",
      is_emergency: false,
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_instructions: "",
      preferred_times: [],
      images: [],
      notes: "",
      status: "pending"
    }
  });

  React.useEffect(() => {
    if (request) {
      console.log("MaintenanceDetailsTab - Setting form values from request:", request);
      form.reset({
        ...request,
        preferred_times: request.preferred_times || []
      });
    }
  }, [request, form]);

  const isEmergency = form.watch("is_emergency");

  const handleSubmit = (data: MaintenanceRequest) => {
    console.log("Submitting maintenance request:", data);
    onUpdateRequest(data);
  };

  return (
    <Form {...form}>
      <DialogTitle className="sr-only">
        {isNew ? "Create Maintenance Request" : "Edit Maintenance Request"}
      </DialogTitle>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="property_id">Property</Label>
            <Select
              value={form.watch("property_id")}
              onValueChange={(value) => form.setValue("property_id", value)}
              disabled={!isNew || userRole === "landlord"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              {...form.register("title")}
              className="mt-1"
              disabled={userRole === "landlord"}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...form.register("description")}
              className="mt-1"
              rows={4}
              disabled={userRole === "landlord"}
            />
          </div>

          <div>
            <Label htmlFor="issue_type">Issue Type</Label>
            <Select
              value={form.watch("issue_type")}
              onValueChange={(value) => form.setValue("issue_type", value)}
              disabled={userRole === "landlord"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="structural">Structural</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high")}
              disabled={userRole === "landlord"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isEmergency}
                onCheckedChange={(checked) => form.setValue("is_emergency", checked as boolean)}
                disabled={userRole === "landlord"}
              />
              <Label>This is an emergency</Label>
            </div>

            {isEmergency && (
              <div className="space-y-4 pl-6">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    {...form.register("emergency_contact_name")}
                    className="mt-1"
                    disabled={userRole === "landlord"}
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    {...form.register("emergency_contact_phone")}
                    className="mt-1"
                    disabled={userRole === "landlord"}
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_instructions">Emergency Instructions</Label>
                  <Textarea
                    {...form.register("emergency_instructions")}
                    placeholder="Any specific instructions for emergency handling..."
                    className="mt-1"
                    disabled={userRole === "landlord"}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>
              Preferred Service Times
            </Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {["morning", "afternoon", "evening"].map((time) => (
                <label key={time} className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.watch("preferred_times")?.includes(time)}
                    onCheckedChange={(checked) => {
                      const currentTimes = form.watch("preferred_times") || [];
                      const newTimes = checked
                        ? [...currentTimes, time]
                        : currentTimes.filter((t) => t !== time);
                      form.setValue("preferred_times", newTimes);
                    }}
                    disabled={userRole === "landlord"}
                  />
                  <span className="capitalize">{time}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              {...form.register("notes")}
              className="mt-1"
              rows={3}
              disabled={userRole === "landlord"}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={userRole === "landlord"}>
            {isNew ? "Create Request" : "Update Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}