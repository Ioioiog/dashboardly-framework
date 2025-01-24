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

  const title = userRole === "landlord" 
    ? t('tenants.title.landlord') 
    : t('tenants.title.tenant');

  const description = userRole === "landlord"
    ? t('tenants.description.landlord')
    : t('tenants.description.tenant');

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
            {title}
          </h1>
          <p className="text-gray-500 max-w-2xl">
            {description}
          </p>
        </div>
        {userRole === "landlord" && (
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <Button
              onClick={() => setShowAssignDialog(true)}
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-4 w-4 text-gray-600" />
              <span>Assign Existing Tenant</span>
            </Button>
            <Button
              onClick={() => setShowInviteDialog(true)}
              className="w-full sm:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Invite New Tenant</span>
            </Button>
          </div>
        )}
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