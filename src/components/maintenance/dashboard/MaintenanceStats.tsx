import { Card } from "@/components/ui/card";
import { MaintenanceRequest } from "@/types/maintenance";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface MaintenanceStatsProps {
  requests: MaintenanceRequest[];
}

export function MaintenanceStats({ requests }: MaintenanceStatsProps) {
  const { t } = useTranslation();
  
  const requestsByStatus = {
    pending: requests?.filter((r) => r.status === "pending").length || 0,
    in_progress: requests?.filter((r) => r.status === "in_progress").length || 0,
    completed: requests?.filter((r) => r.status === "completed").length || 0,
  };

  const highPriorityCount = requests?.filter((r) => r.priority === "High" && r.status !== "completed").length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-600">{t('maintenance.status.pending')}</p>
            <p className="text-2xl font-bold text-yellow-700">{requestsByStatus.pending}</p>
          </div>
          <Clock className="h-5 w-5 text-yellow-500" />
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">{t('maintenance.status.in_progress')}</p>
            <p className="text-2xl font-bold text-blue-700">{requestsByStatus.in_progress}</p>
          </div>
          <Clock className="h-5 w-5 text-blue-500" />
        </div>
      </Card>

      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">{t('maintenance.status.completed')}</p>
            <p className="text-2xl font-bold text-green-700">{requestsByStatus.completed}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
      </Card>

      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">{t('maintenance.priority.high')}</p>
            <p className="text-2xl font-bold text-red-700">{highPriorityCount}</p>
          </div>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
      </Card>
    </div>
  );
}