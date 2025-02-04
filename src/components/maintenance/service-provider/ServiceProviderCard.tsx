import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
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
    <Card className={cn("p-6 space-y-6", provider.isPreferred && "border-2 border-primary")}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-blue-500">
            {provider.business_name || `${provider.profiles[0]?.first_name} ${provider.profiles[0]?.last_name}`}
          </h3>
          {provider.description && (
            <p className="text-gray-600">
              {provider.description}
            </p>
          )}
        </div>
        {provider.rating && (
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600">
              {provider.rating.toFixed(1)}
              {provider.review_count > 0 && (
                <span className="text-sm text-gray-500 ml-1">
                  ({provider.review_count} reviews)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Services Offered</h4>
          <ServiceProviderServices services={provider.services} />
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
          <ServiceProviderContact 
            phone={provider.contact_phone}
            email={provider.contact_email}
            website={provider.website}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant={provider.isPreferred ? "secondary" : "warning"}
            className={cn(
              "flex-1",
              provider.isPreferred 
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" 
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
            onClick={() => onPreferredToggle(provider)}
          >
            {provider.isPreferred ? '★ Preferred Provider' : 'Add to Preferred'}
          </Button>
          <Button 
            variant="default"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Create Maintenance Request
          </Button>
        </div>
      </div>
    </Card>
  );
}