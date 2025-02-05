import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";

interface ServiceProvider {
  id: string;
  business_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
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
  isLoadingProviders: boolean;
  isReadOnly?: boolean;
}

export function LandlordFields({
  formData,
  onFieldChange,
  isLoadingProviders,
  isReadOnly = false
}: LandlordFieldsProps) {
  const { t } = useTranslation();
  const { currentUserId } = useAuthState();

  const statusOptions = [
    { value: "pending", label: t("maintenance.status.pending") },
    { value: "in_progress", label: t("maintenance.status.in_progress") },
    { value: "completed", label: t("maintenance.status.completed") },
    { value: "cancelled", label: t("maintenance.status.cancelled") }
  ];

  // Query to fetch preferred service providers for the landlord
  const { data: preferredProviders, isLoading: isLoadingPreferred } = useQuery({
    queryKey: ['preferred-service-providers', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      console.log("Fetching preferred service providers for landlord:", currentUserId);
      
      const { data, error } = await supabase
        .from('landlord_service_providers')
        .select(`
          service_provider_id,
          service_provider_profiles!inner (
            id,
            business_name,
            profiles!inner (
              first_name,
              last_name
            )
          )
        `)
        .eq('landlord_id', currentUserId);

      if (error) {
        console.error("Error fetching preferred providers:", error);
        return [];
      }

      console.log("Fetched preferred providers:", data);
      return data.map(item => ({
        id: item.service_provider_profiles.id,
        business_name: item.service_provider_profiles.business_name,
        first_name: item.service_provider_profiles.profiles.first_name,
        last_name: item.service_provider_profiles.profiles.last_name
      }));
    },
    enabled: !!currentUserId
  });

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
          service_provider_profiles!left (
            business_name
          )
        `)
        .eq('id', formData.assigned_to)
        .maybeSingle();

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

    // First check the preferred providers
    const preferredProvider = preferredProviders?.find(p => p.id === id);
    if (preferredProvider) {
      return preferredProvider.business_name || 
             `${preferredProvider.first_name || ''} ${preferredProvider.last_name || ''}`.trim();
    }

    // Then check the assigned provider details
    if (assignedProvider) {
      const businessName = assignedProvider.service_provider_profiles?.[0]?.business_name;
      if (businessName) return businessName;
      
      return `${assignedProvider.first_name || ''} ${assignedProvider.last_name || ''}`.trim();
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
        {isLoadingProviders || isLoadingPreferred ? (
          <Skeleton className="h-10 w-full" />
        ) : isReadOnly ? (
          <div className="p-3 bg-gray-50 rounded-md border">
            {getServiceProviderName(formData.assigned_to)}
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
              {(preferredProviders || []).map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.business_name || `${provider.first_name || ''} ${provider.last_name || ''}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}