import React from "react";
import { Phone, Mail, Globe } from "lucide-react";

interface ServiceProviderContactProps {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

export function ServiceProviderContact({ phone, email, website }: ServiceProviderContactProps) {
  if (!phone && !email && !website) return null;

  return (
    <div className="space-y-3">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <Phone className="h-4 w-4" />
          {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <Mail className="h-4 w-4" />
          {email}
        </a>
      )}
      {website && (
        <a
          href={website}
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