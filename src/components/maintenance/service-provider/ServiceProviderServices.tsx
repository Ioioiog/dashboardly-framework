import React from "react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-3">
      {services.map((service, index) => (
        <div 
          key={index}
          className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100"
        >
          <span className="text-gray-800">{service.name}</span>
          {service.base_price && (
            <span className="text-blue-500 font-medium">
              ${service.base_price}{service.price_unit ? `/${service.price_unit}` : ''}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}