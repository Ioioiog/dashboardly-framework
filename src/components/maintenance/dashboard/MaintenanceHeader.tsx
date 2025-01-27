import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import { Plus, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MaintenanceHeaderProps {
  onNewRequest: () => void;
}

export function MaintenanceHeader({ onNewRequest }: MaintenanceHeaderProps) {
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          {t('maintenance.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {userRole === 'tenant' 
            ? t('maintenance.description.tenant')
            : t('maintenance.description.landlord')}
        </p>
      </div>
      
      {userRole === 'tenant' && (
        <Button onClick={onNewRequest} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('maintenance.newRequest')}
        </Button>
      )}
    </div>
  );
}