import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceProvider {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export interface LandlordFieldsProps {
  serviceProviders: ServiceProvider[];
  formData: {
    assigned_to: string | null;
    service_provider_notes: string | null;
    notes: string | null;
  };
  onChange: (field: string, value: string | null) => void;
  userRole?: string;
}

export function LandlordFields({ serviceProviders, formData, onChange, userRole = "tenant" }: LandlordFieldsProps) {
  const isLandlord = userRole === "landlord";

  const getServiceProviderName = (id: string | null) => {
    if (!id) return "Not assigned";
    const provider = serviceProviders.find(p => p.id === id);
    return provider ? `${provider.first_name} ${provider.last_name}` : "Not assigned";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Service Provider</Label>
      </div>

      {isLandlord ? (
        <Select
          value={formData.assigned_to || undefined}
          onValueChange={(value) => onChange("assigned_to", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service provider" />
          </SelectTrigger>
          <SelectContent>
            {serviceProviders?.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.first_name} {provider.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="p-3 bg-gray-50 rounded-md border">
          {getServiceProviderName(formData.assigned_to)}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="service_provider_notes">Instructions for Service Provider</Label>
        {isLandlord ? (
          <Textarea
            id="service_provider_notes"
            value={formData.service_provider_notes || ""}
            onChange={(e) => onChange("service_provider_notes", e.target.value)}
            placeholder="Add any specific instructions for the service provider..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
            {formData.service_provider_notes || "No instructions provided"}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal_notes">Internal Notes</Label>
        {isLandlord ? (
          <Textarea
            id="internal_notes"
            value={formData.notes || ""}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Add any internal notes..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
            {formData.notes || "No internal notes"}
          </div>
        )}
      </div>
    </div>
  );
}