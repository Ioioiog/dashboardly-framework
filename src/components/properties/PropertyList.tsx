import React from "react";
import { PropertyCard } from "./PropertyCard";
import { Card } from "@/components/ui/card";
import { Property } from "@/utils/propertyUtils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface PropertyListProps {
  properties: Property[] | undefined;
  isLoading: boolean;
  userRole: "landlord" | "tenant";
  onEdit?: (property: Property, data: any) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyList({ 
  properties, 
  isLoading, 
  userRole, 
  onEdit, 
  onDelete 
}: PropertyListProps) {
  const { t } = useTranslation();

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state if properties is undefined
  if (properties === undefined) {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>
            {t('properties.error.fetch')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show empty state
  if (!properties.length) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <div className="text-center space-y-2">
            <p className="text-gray-500">
              {userRole === "landlord" 
                ? t('properties.empty.landlord')
                : t('properties.empty.tenant')}
            </p>
            {userRole === "tenant" && (
              <p className="text-sm text-gray-400">
                {t('properties.empty.tenant.contact')}
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Show property grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          userRole={userRole}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}