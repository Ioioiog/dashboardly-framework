import React from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Property } from "@/utils/propertyUtils";
import { useTranslation } from "react-i18next";

interface PropertyCardHeaderProps {
  property: Property;
}

export function PropertyCardHeader({ property }: PropertyCardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {property.name}
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-gray-600 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            {property.address}
          </p>
          <p className="text-lg font-medium flex items-center gap-2 text-blue-600">
            <DollarSign className="h-5 w-5" />
            ${property.monthly_rent}/{t('properties.rent.period')}
          </p>
        </div>
        {property.type && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
            {t('properties.type')}: {property.type}
          </span>
        )}
        {property.description && (
          <p className="text-sm text-gray-600 leading-relaxed mt-2 bg-gray-50 p-3 rounded-md">
            {property.description}
          </p>
        )}
      </div>
    </div>
  );
}