import { useState } from "react";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceRequest } from "@/types/maintenance";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { MaintenanceStats } from "@/components/maintenance/dashboard/MaintenanceStats";
import { MaintenanceHeader } from "@/components/maintenance/dashboard/MaintenanceHeader";
import { useMaintenanceRequests } from "@/hooks/maintenance/useMaintenanceRequests";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

export default function Maintenance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const { userRole } = useUserRole();
  const { data: requests, isLoading, markAsRead } = useMaintenanceRequests();
  const { t } = useTranslation();

  const filteredRequests = requests?.filter((request) => {
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority = !priorityFilter || request.priority === priorityFilter;
    const matchesProperty = !propertyFilter || request.property_id === propertyFilter;
    return matchesStatus && matchesPriority && matchesProperty;
  });

  const pendingRequests = filteredRequests?.filter(r => r.status === 'pending') || [];
  const inProgressRequests = filteredRequests?.filter(r => r.status === 'in_progress') || [];
  const completedRequests = filteredRequests?.filter(r => r.status === 'completed') || [];

  const handleRequestClick = async (request: MaintenanceRequest) => {
    console.log('Handling request click:', request.id);
    setSelectedRequest(request);
    
    if (userRole === 'landlord' && !request.read_by_landlord) {
      console.log('Marking request as read for landlord');
      await markAsRead.mutate(request.id);
    } else if (userRole === 'tenant' && !request.read_by_tenant) {
      console.log('Marking request as read for tenant');
      await markAsRead.mutate(request.id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 space-y-6">
          <Card className="p-6">
            <MaintenanceHeader onNewRequest={() => setIsDialogOpen(true)} />
            {userRole === 'landlord' && <MaintenanceStats requests={requests || []} />}
          </Card>

          <MaintenanceFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            propertyFilter={propertyFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onPropertyChange={setPropertyFilter}
            userRole={userRole}
          />

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">
                {t('maintenance.tabs.all')} ({filteredRequests?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t('maintenance.status.pending')} ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                {t('maintenance.status.in_progress')} ({inProgressRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('maintenance.status.completed')} ({completedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <MaintenanceList
                requests={filteredRequests || []}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />
            </TabsContent>

            <TabsContent value="pending">
              <MaintenanceList
                requests={pendingRequests}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />
            </TabsContent>

            <TabsContent value="in_progress">
              <MaintenanceList
                requests={inProgressRequests}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />
            </TabsContent>

            <TabsContent value="completed">
              <MaintenanceList
                requests={completedRequests}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />
            </TabsContent>
          </Tabs>

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