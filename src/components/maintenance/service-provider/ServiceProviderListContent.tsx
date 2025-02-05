import React from "react";
import { ServiceProviderCard } from "./ServiceProviderCard";
import { Card } from "@/components/ui/card";

interface ServiceProvider {
  id: string;
  business_name?: string | null;
  description?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
  service_area?: string[];
  rating?: number;
  review_count?: number;
  profiles: Array<{
    first_name: string | null;
    last_name: string | null;
  }>;
  services?: Array<{
    name: string;
    base_price?: number;
    price_unit?: string;
    category: string;
  }>;
  isPreferred?: boolean;
}

interface ServiceProviderListContentProps {
  providers: ServiceProvider[] | undefined;
  isLoading: boolean;
  onPreferredToggle: (provider: ServiceProvider) => void;
  onEdit: (provider: ServiceProvider) => void;
  userRole: string | null;
}

export function ServiceProviderListContent({
  providers,
  isLoading,
  onPreferredToggle,
  onEdit,
  userRole
}: ServiceProviderListContentProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No service providers found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <ServiceProviderCard
          key={provider.id}
          provider={provider}
          onPreferredToggle={onPreferredToggle}
          onEdit={onEdit}
          showEditButton={userRole !== 'service_provider'}
        />
      ))}
    </div>
  );
}