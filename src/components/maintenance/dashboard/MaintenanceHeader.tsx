import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MaintenanceHeaderProps {
  onNewRequest: () => void;
}

export function MaintenanceHeader({ onNewRequest }: MaintenanceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Maintenance Requests
      </h1>
      <Button 
        onClick={onNewRequest}
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Request
      </Button>
    </div>
  );
}