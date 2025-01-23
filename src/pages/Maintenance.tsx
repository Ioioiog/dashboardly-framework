import { useQuery } from "@tanstack/react-query";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function Maintenance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      console.log("Fetching maintenance requests...");
      const { data: maintenanceRequests, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(
            id,
            name,
            address
          ),
          tenant:profiles!maintenance_requests_tenant_id_fkey(
            id,
            first_name,
            last_name,
            email
          ),
          assignee:profiles!maintenance_requests_assigned_to_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      console.log("Fetched maintenance requests:", maintenanceRequests);
      return maintenanceRequests as MaintenanceRequest[];
    },
  });

  const filteredRequests = requests?.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    const matchesProperty =
      propertyFilter === "all" || request.property_id === propertyFilter;
    return matchesStatus && matchesPriority && matchesProperty;
  });

  const requestsByStatus = {
    pending: requests?.filter((r) => r.status === "pending").length || 0,
    in_progress: requests?.filter((r) => r.status === "in_progress").length || 0,
    completed: requests?.filter((r) => r.status === "completed").length || 0,
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Maintenance Requests</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Pending</h3>
              <p className="text-2xl">{requestsByStatus.pending}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">In Progress</h3>
              <p className="text-2xl">{requestsByStatus.in_progress}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Completed</h3>
              <p className="text-2xl">{requestsByStatus.completed}</p>
            </Card>
          </div>

          <MaintenanceFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            propertyFilter={propertyFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onPropertyChange={setPropertyFilter}
          />

          <MaintenanceList
            requests={filteredRequests || []}
            isLoading={isLoading}
            onRequestClick={setSelectedRequest}
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