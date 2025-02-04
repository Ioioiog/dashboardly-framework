import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

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
    status?: string;
  };
  onChange: (field: string, value: string | null) => void;
  userRole?: string;
  isExistingRequest?: boolean;
  isLoadingProviders?: boolean;
}

export function LandlordFields({ 
  serviceProviders, 
  formData, 
  onChange, 
  userRole = "tenant",
  isExistingRequest,
  isLoadingProviders = false
}: LandlordFieldsProps) {
  const { t } = useTranslation();
  const isLandlord = userRole === "landlord";
  const isServiceProvider = userRole === "service_provider";

  const statusOptions = [
    { value: "pending", label: t("maintenance.status.pending") },
    { value: "in_progress", label: t("maintenance.status.in_progress") },
    { value: "completed", label: t("maintenance.status.completed") },
    { value: "cancelled", label: t("maintenance.status.cancelled") }
  ];

  const getServiceProviderName = (id: string | null) => {
    if (!id) return "Not assigned";
    
    console.log("Looking for provider with ID:", id);
    console.log("Available providers:", serviceProviders);
    
    const provider = serviceProviders.find(p => p.id === id);
    return provider 
      ? `${provider.first_name || ''} ${provider.last_name || ''}`.trim() 
      : "Not assigned";
  };

  return (
    <div className="space-y-4">
      {isExistingRequest && (
        <div className="space-y-2">
          <Label>{t("maintenance.form.status")}</Label>
          {isLandlord || isServiceProvider ? (
            <Select
              value={formData.status || "pending"}
              onValueChange={(value) => onChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("maintenance.form.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {formData.status || "pending"}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Service Provider</Label>
        {isLoadingProviders ? (
          <Skeleton className="h-10 w-full" />
        ) : isLandlord ? (
          <Select
            value={formData.assigned_to || "unassigned"}
            onValueChange={(value) => {
              console.log("Selected service provider:", value);
              onChange("assigned_to", value === "unassigned" ? null : value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Not assigned</SelectItem>
              {serviceProviders?.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {`${provider.first_name || ''} ${provider.last_name || ''}`.trim() || "Unnamed Provider"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border">
            {getServiceProviderName(formData.assigned_to)}
          </div>
        )}
      </div>

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
        {isLandlord || isServiceProvider ? (
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