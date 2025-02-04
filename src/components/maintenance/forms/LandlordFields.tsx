import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceProvider {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface FormData {
  status?: string;
  assigned_to?: string | null;
  service_provider_notes?: string | null;
  notes?: string | null;
}

interface LandlordFieldsProps {
  formData: FormData;
  onFieldChange: (field: string, value: any) => void;
  serviceProviders: ServiceProvider[];
  isLoadingProviders: boolean;
  isReadOnly?: boolean;
}

export function LandlordFields({
  formData,
  onFieldChange,
  serviceProviders,
  isLoadingProviders,
  isReadOnly = false
}: LandlordFieldsProps) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: "pending", label: t("maintenance.status.pending") },
    { value: "in_progress", label: t("maintenance.status.in_progress") },
    { value: "completed", label: t("maintenance.status.completed") },
    { value: "cancelled", label: t("maintenance.status.cancelled") }
  ];

  // Query to fetch provider details if assigned
  const { data: assignedProvider } = useQuery({
    queryKey: ['service-provider-details', formData.assigned_to],
    queryFn: async () => {
      if (!formData.assigned_to) return null;
      
      console.log("Fetching provider details for ID:", formData.assigned_to);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          service_provider_profiles!inner (
            business_name
          )
        `)
        .eq('id', formData.assigned_to)
        .single();

      if (error) {
        console.error("Error fetching provider details:", error);
        return null;
      }

      console.log("Fetched provider details:", data);
      return data;
    },
    enabled: !!formData.assigned_to
  });

  const getServiceProviderName = (id: string | null) => {
    if (!id) return "Not assigned";

    // First check the passed serviceProviders array
    const providerFromList = serviceProviders.find(p => p.id === id);
    if (providerFromList) {
      const firstName = providerFromList.first_name || '';
      const lastName = providerFromList.last_name || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    // Then check the queried provider data
    if (assignedProvider) {
      const firstName = assignedProvider.first_name || '';
      const lastName = assignedProvider.last_name || '';
      const businessName = assignedProvider.service_provider_profiles?.[0]?.business_name;
      
      if (businessName) {
        return businessName;
      }
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    return "Not assigned";
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t("maintenance.form.status")}
        </label>
        {isReadOnly ? (
          <div className="p-3 bg-gray-50 rounded-md border">
            {formData.status ? t(`maintenance.status.${formData.status}`) : "-"}
          </div>
        ) : (
          <Select
            value={formData.status}
            onValueChange={(value) => onFieldChange("status", value)}
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
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Service Provider</label>
        {isLoadingProviders ? (
          <Skeleton className="h-10 w-full" />
        ) : isReadOnly ? (
          <div className="p-3 bg-gray-50 rounded-md border">
            {getServiceProviderName(formData.assigned_to || null)}
          </div>
        ) : (
          <Select
            value={formData.assigned_to || "unassigned"}
            onValueChange={(value) => onFieldChange("assigned_to", value === "unassigned" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Not assigned</SelectItem>
              {serviceProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.first_name} {provider.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}