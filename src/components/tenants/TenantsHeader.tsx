import { useTranslation } from "react-i18next";
import { TenantInviteDialog } from "./TenantInviteDialog";
import { Property } from "@/utils/propertyUtils";
import { TenantAssignDialog } from "./TenantAssignDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail } from "lucide-react";
import { useState } from "react";

interface TenantsHeaderProps {
  properties: Property[];
  userRole: "landlord" | "tenant";
}

export function TenantsHeader({ properties, userRole }: TenantsHeaderProps) {
  const { t } = useTranslation();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('tenants.title')}</h1>
        <p className="text-muted-foreground">
          {t('tenants.description')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowAssignDialog(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Assign Tenant
        </Button>
        <Button
          onClick={() => setShowInviteDialog(true)}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Invite Tenant
        </Button>
      </div>

      <TenantInviteDialog
        properties={properties}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
      
      <TenantAssignDialog
        properties={properties}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
      />
    </div>
  );
}