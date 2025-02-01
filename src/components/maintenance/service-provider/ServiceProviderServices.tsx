import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";

interface ServiceProviderService {
  name: string;
  base_price?: number;
  price_unit?: string;
  category: string;
}

interface ServiceProviderServicesProps {
  services?: ServiceProviderService[];
}

export function ServiceProviderServices({ services }: ServiceProviderServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Wrench className="h-4 w-4" />
        <span>Services Offered:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {services.map((service, index) => (
          <Badge key={index} variant="outline">
            {service.name}
            {service.base_price && ` - ${service.base_price} ${service.price_unit || ''}`}
          </Badge>
        ))}
      </div>
    </div>
  );
}