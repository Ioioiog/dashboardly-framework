import React from "react";
import { Phone, Mail, Globe } from "lucide-react";

interface ServiceProvider {
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
}

interface ServiceProviderContactProps {
  provider: ServiceProvider;
}

export function ServiceProviderContact({ provider }: ServiceProviderContactProps) {
  if (!provider.contact_phone && !provider.contact_email && !provider.website) return null;

  return (
    <div className="space-y-3">
      {provider.contact_phone && (
        <a
          href={`tel:${provider.contact_phone}`}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <Phone className="h-4 w-4" />
          {provider.contact_phone}
        </a>
      )}
      {provider.contact_email && (
        <a
          href={`mailto:${provider.contact_email}`}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <Mail className="h-4 w-4" />
          {provider.contact_email}
        </a>
      )}
      {provider.website && (
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <Globe className="h-4 w-4" />
          Visit Website
        </a>
      )}
    </div>
  );
}