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
  userRole?: string;
}

export function LandlordFields({
  formData,
  onFieldChange,
  isLoadingProviders,
  isReadOnly = false,
  userRole
}: LandlordFieldsProps) {
  const { t } = useTranslation();
  const { currentUserId } = useAuthState();

  const statusOptions = [
    { value: "pending", label: t("maintenance.status.pending") },
    { value: "in_progress", label: t("maintenance.status.in_progress") },
    { value: "completed", label: t("maintenance.status.completed") },
    { value: "cancelled", label: t("maintenance.status.cancelled") }
  ];

  // Query to fetch all service providers
  const { data: allServiceProviders, isLoading: isLoadingAllProviders } = useQuery({
    queryKey: ['service-providers'],
    queryFn: async () => {
      console.log("Fetching all service providers");
      
      const { data, error } = await supabase
        .from('service_provider_profiles')
        .select(`
          id,
          business_name,
          profiles!inner (
            first_name,
            last_name
          )
        `);

      if (error) {
        console.error("Error fetching service providers:", error);
        return [];
      }

      console.log("Fetched all service providers:", data);
      return data.map(provider => ({
        id: provider.id,
        business_name: provider.business_name,
        first_name: provider.profiles.first_name,
        last_name: provider.profiles.last_name
      }));
    }
  });

  // Query to fetch provider details if assigned
  const { data: assignedProvider } = useQuery({
    queryKey: ['service-provider-details', formData.assigned_to],
    queryFn: async () => {
      if (!formData.assigned_to) return null;
      
      console.log("Fetching provider details for ID:", formData.assigned_to);
      
      const { data, error } = await supabase
        .from('service_provider_profiles')
        .select(`
          id,
          business_name,
          profiles!inner (
            first_name,
            last_name
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

  const getServiceProviderName = (provider: ServiceProvider | null) => {
    if (!provider) return "Not assigned";
    return provider.business_name || 
           `${provider.first_name || ''} ${provider.last_name || ''}`.trim();
  };

  const canAssignProvider = userRole === 'landlord';

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
        {isLoadingProviders || isLoadingAllProviders ? (
          <Skeleton className="h-10 w-full" />
        ) : isReadOnly || !canAssignProvider ? (
          <div className="p-3 bg-gray-50 rounded-md border">
            {getServiceProviderName(assignedProvider || null)}
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
              {(allServiceProviders || []).map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {getServiceProviderName(provider)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}