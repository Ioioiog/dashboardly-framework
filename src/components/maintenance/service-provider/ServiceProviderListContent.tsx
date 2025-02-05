import React from "react";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { ServiceProviderCard } from "./ServiceProviderCard";

interface ServiceProviderService {
  name: string;
  base_price?: number;
  price_unit?: string;
  category: string;
}

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
  services?: ServiceProviderService[];
  isPreferred?: boolean;
}

interface ServiceProviderListContentProps {
  providers: ServiceProvider[] | undefined;
  isLoading: boolean;
  onPreferredToggle: (provider: ServiceProvider) => Promise<void>;
}

export function ServiceProviderListContent({ 
  providers, 
  isLoading, 
  onPreferredToggle 
}: ServiceProviderListContentProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!providers?.length) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">No Service Providers Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              There are currently no service providers available. Click the button above to add your first service provider.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {providers.map((provider) => (
        <ServiceProviderCard
          key={provider.id}
          provider={provider}
          onPreferredToggle={onPreferredToggle}
        />
      ))}
    </div>
  );
}