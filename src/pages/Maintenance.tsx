import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { useQuery } from "@tanstack/react-query";

export default function Maintenance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const { toast } = useToast();
  const { userRole } = useUserRole();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['maintenance-requests', userRole],
    queryFn: async () => {
      console.log('Fetching maintenance requests for role:', userRole);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const query = supabase
          .from('maintenance_requests')
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
          `);

        // If user is a tenant, only show their requests
        if (userRole === 'tenant') {
          query.eq('tenant_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching maintenance requests:', error);
          throw error;
        }

        console.log('Fetched maintenance requests:', data);
        return data as MaintenanceRequest[];
      } catch (error) {
        console.error('Error in maintenance requests query:', error);
        toast({
          title: "Error",
          description: "Failed to fetch maintenance requests",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  const filteredRequests = requests?.filter((request) => {
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority = !priorityFilter || request.priority === priorityFilter;
    const matchesProperty = !propertyFilter || request.property_id === propertyFilter;
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

          {userRole === 'landlord' && (
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
          )}

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