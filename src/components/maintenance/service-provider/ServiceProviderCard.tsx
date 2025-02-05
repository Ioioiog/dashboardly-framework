import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit } from "lucide-react";
import { ServiceProviderContact } from "./ServiceProviderContact";
import { ServiceProviderServices } from "./ServiceProviderServices";

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
  onEdit: (provider: ServiceProvider) => void;
  showEditButton: boolean;
}

export function ServiceProviderCard({
  provider,
  onPreferredToggle,
  onEdit,
  showEditButton
}: ServiceProviderCardProps) {
  const displayName = provider.business_name || 
    `${provider.profiles[0]?.first_name} ${provider.profiles[0]?.last_name}`;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{displayName}</h3>
          {provider.description && (
            <p className="text-gray-600 mt-1">{provider.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={provider.isPreferred ? "default" : "outline"}
            size="sm"
            onClick={() => onPreferredToggle(provider)}
          >
            <Star className={`h-4 w-4 ${provider.isPreferred ? "fill-current" : ""}`} />
            <span className="ml-1">
              {provider.isPreferred ? "Preferred" : "Add to Preferred"}
            </span>
          </Button>
          {showEditButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(provider)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ServiceProviderContact provider={provider} />
      <ServiceProviderServices services={provider.services || []} />
    </Card>
  );
}