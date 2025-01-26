import { useState, useEffect } from "react";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceRequest } from "@/types/maintenance";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { MaintenanceStats } from "@/components/maintenance/dashboard/MaintenanceStats";
import { MaintenanceHeader } from "@/components/maintenance/dashboard/MaintenanceHeader";
import { useMaintenanceRequests } from "@/hooks/maintenance/useMaintenanceRequests";

export default function Maintenance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const { userRole } = useUserRole();
  const { data: requests, isLoading, markAsRead } = useMaintenanceRequests();

  const filteredRequests = requests?.filter((request) => {
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority = !priorityFilter || request.priority === priorityFilter;
    const matchesProperty = !propertyFilter || request.property_id === propertyFilter;
    return matchesStatus && matchesPriority && matchesProperty;
  });

  const handleRequestClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    // Mark as read when viewing the request
    markAsRead.mutate(request.id);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
            <MaintenanceHeader onNewRequest={() => setIsDialogOpen(true)} />
            {userRole === 'landlord' && <MaintenanceStats requests={requests || []} />}
          </div>

          <MaintenanceFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            propertyFilter={propertyFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onPropertyChange={setPropertyFilter}
            userRole={userRole}
          />

          <MaintenanceList
            requests={filteredRequests || []}
            isLoading={isLoading}
            onRequestClick={handleRequestClick}
          />

          <MaintenanceDialog
            open={isDialogOpen || !!selectedRequest}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setSelectedRequest(null);
            }}
            request={selectedRequest}
          />
        </div>
      </div>
    </div>
  );
}