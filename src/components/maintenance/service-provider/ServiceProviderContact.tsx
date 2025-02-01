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
    <div className="flex flex-col space-y-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <Phone className="h-4 w-4" />
          {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
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
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <Globe className="h-4 w-4" />
          Website
        </a>
      )}
    </div>
  );
}