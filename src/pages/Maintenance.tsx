import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { MaintenanceHeader } from "@/components/maintenance/dashboard/MaintenanceHeader";
import { MaintenanceSection } from "@/components/maintenance/dashboard/MaintenanceSection";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";

type PriorityFilter = "all" | "low" | "medium" | "high";

export default function Maintenance() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>();
  const [priority, setPriority] = React.useState<PriorityFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();

  const { data: maintenanceRequests, isLoading } = useQuery({
    queryKey: ["maintenance-requests", priority],
    queryFn: async () => {
      console.log("Fetching maintenance requests with filters:", { 
        priority,
        userRole,
        currentUserId 
      });
      
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(name),
          tenant:profiles!maintenance_requests_tenant_id_fkey(
            first_name,
            last_name
          )
        `);

      if (priority !== "all") {
        query = query.eq("priority", priority);
      }

      // Add role-specific filters
      if (userRole === 'tenant') {
        query = query.eq('tenant_id', currentUserId);
      } else if (userRole === 'service_provider') {
        query = query.eq('assigned_to', currentUserId);
      }
      // For landlords, the RLS policy will handle filtering

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }
      
      console.log("Fetched maintenance requests:", data);
      return data;
    },
  });

  const filteredRequests = React.useMemo(() => {
    if (!maintenanceRequests) return [];
    
    console.log("Filtering requests with search query:", searchQuery);
    
    return maintenanceRequests.filter(request => 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [maintenanceRequests, searchQuery]);

  const newRequests = filteredRequests.filter(r => r.status === "pending");
  const activeRequests = filteredRequests.filter(r => r.status === "in_progress");
  const reviewRequests = filteredRequests.filter(r => 
    r.status !== "completed" && r.status !== "cancelled"
  );

  console.log("Filtered requests counts:", {
    new: newRequests.length,
    active: activeRequests.length,
    review: reviewRequests.length
  });

  const handleRequestClick = (requestId: string) => {
    console.log("Opening maintenance request:", requestId);
    setSelectedRequestId(requestId);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <MaintenanceHeader
            priority={priority}
            onPriorityChange={(value) => setPriority(value as PriorityFilter)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MaintenanceSection
              title="New Requests"
              description="Requests needing review"
              requests={newRequests}
              onRequestClick={handleRequestClick}
            />
            
            <MaintenanceSection
              title="Active Requests"
              description="Requests in progress"
              requests={activeRequests}
              onRequestClick={handleRequestClick}
            />
            
            <MaintenanceSection
              title="Review & Complete"
              description="Work completed, awaiting final review"
              requests={reviewRequests}
              onRequestClick={handleRequestClick}
            />
          </div>

          <MaintenanceDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setSelectedRequestId(undefined);
            }}
            requestId={selectedRequestId}
          />
        </div>
      </div>
    </div>
  );
}