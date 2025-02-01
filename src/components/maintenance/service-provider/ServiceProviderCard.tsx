import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceProviderContact } from "./ServiceProviderContact";
import { ServiceProviderServices } from "./ServiceProviderServices";
import { Button } from "@/components/ui/button";

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

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onPreferredToggle: (provider: ServiceProvider) => void;
}

export function ServiceProviderCard({ provider, onPreferredToggle }: ServiceProviderCardProps) {
  return (
    <Card 
      className={cn(
        "p-6 space-y-4",
        provider.isPreferred && "border-2 border-primary"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {provider.business_name || `${provider.profiles[0]?.first_name} ${provider.profiles[0]?.last_name}`}
            </h3>
            {provider.isPreferred && (
              <Badge variant="secondary" className="ml-2">
                Preferred
              </Badge>
            )}
          </div>
          {provider.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {provider.description}
            </p>
          )}
        </div>
        {provider.rating && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" /> {provider.rating.toFixed(1)}
            {provider.review_count > 0 && (
              <span className="text-xs">({provider.review_count})</span>
            )}
          </Badge>
        )}
      </div>

      {provider.service_area && provider.service_area.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Service Areas: {provider.service_area.join(', ')}</span>
        </div>
      )}

      <ServiceProviderServices services={provider.services} />
      <ServiceProviderContact 
        phone={provider.contact_phone}
        email={provider.contact_email}
        website={provider.website}
      />

      <div className="pt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onPreferredToggle(provider)}
        >
          {provider.isPreferred ? 'Remove from Preferred' : 'Add to Preferred'}
        </Button>
      </div>
    </Card>
  );
}