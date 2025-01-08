import React from "react";
import { useTranslation } from "react-i18next";
import { TenantInviteDialog } from "./TenantInviteDialog";
import { Property } from "@/utils/propertyUtils";

interface TenantsHeaderProps {
  userRole: "landlord" | "tenant";
  properties: Property[];
}

export const TenantsHeader = ({ userRole, properties }: TenantsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          {userRole === "landlord" 
            ? t('tenants.title.landlord') 
            : t('tenants.title.tenant')}
        </h1>
        <p className="mt-2 text-dashboard-text">
          {userRole === "landlord"
            ? t('tenants.description.landlord')
            : t('tenants.description.tenant')}
        </p>
      </div>
      {userRole === "landlord" && <TenantInviteDialog properties={properties} />}
    </header>
  );
};