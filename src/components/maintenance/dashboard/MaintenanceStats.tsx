import { Card } from "@/components/ui/card";
import { MaintenanceRequest } from "@/types/maintenance";

interface MaintenanceStatsProps {
  requests: MaintenanceRequest[];
}

export function MaintenanceStats({ requests }: MaintenanceStatsProps) {
  const requestsByStatus = {
    pending: requests?.filter((r) => r.status === "pending").length || 0,
    in_progress: requests?.filter((r) => r.status === "in_progress").length || 0,
    completed: requests?.filter((r) => r.status === "completed").length || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card className="p-6 bg-white hover:shadow-md transition-shadow duration-200">
        <h3 className="font-semibold text-gray-700 mb-2">Pending</h3>
        <p className="text-2xl font-bold text-blue-600">{requestsByStatus.pending}</p>
      </Card>
      <Card className="p-6 bg-white hover:shadow-md transition-shadow duration-200">
        <h3 className="font-semibold text-gray-700 mb-2">In Progress</h3>
        <p className="text-2xl font-bold text-yellow-600">{requestsByStatus.in_progress}</p>
      </Card>
      <Card className="p-6 bg-white hover:shadow-md transition-shadow duration-200">
        <h3 className="font-semibold text-gray-700 mb-2">Completed</h3>
        <p className="text-2xl font-bold text-green-600">{requestsByStatus.completed}</p>
      </Card>
    </div>
  );
}