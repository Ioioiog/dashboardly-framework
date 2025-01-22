import React from "react";
import { useTranslation } from "react-i18next";
import { TenantInviteDialog } from "./TenantInviteDialog";
import { Property } from "@/utils/propertyUtils";
import { TenantAssignDialog } from "@/components/properties/TenantAssignDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail } from "lucide-react";
import { useState } from "react";

interface TenantsHeaderProps {
  userRole: "landlord" | "tenant";
  properties: Property[];
}

export const TenantsHeader = ({ userRole, properties }: TenantsHeaderProps) => {
  const { t } = useTranslation();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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
      {userRole === "landlord" && (
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAssignDialog(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Tenant
          </Button>
          <Button
            onClick={() => setShowInviteDialog(true)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Invite Tenant
          </Button>
        </div>
      )}

      {showAssignDialog && (
        <TenantAssignDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          propertyId={null}
          propertyName={null}
        />
      )}

      {showInviteDialog && (
        <TenantInviteDialog properties={properties} />
      )}
    </header>
  );
};