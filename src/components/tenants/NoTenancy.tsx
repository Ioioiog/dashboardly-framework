import React from "react";
import { useTranslation } from "react-i18next";

export const NoTenancy = () => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
      <p className="text-muted-foreground">
        {t('tenants.noTenancy.message')}
      </p>
    </div>
  );
};