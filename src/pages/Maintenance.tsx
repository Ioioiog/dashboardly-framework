import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import MaintenanceDialog from "@/components/maintenance/MaintenanceDialog";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { MaintenanceBoard } from "@/components/maintenance/sections/MaintenanceBoard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high" | "all";

export default function Maintenance() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>();
  const [priority, setPriority] = React.useState<Priority>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Maintenance Request Updated",
              description: "A maintenance request has been updated.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const { data: maintenanceRequests, isLoading } = useQuery({
    queryKey: ["maintenance-requests", priority, currentUserId],
    queryFn: async () => {
      console.log("Fetching maintenance requests with filters:", { priority, userRole, currentUserId });
      
      if (!currentUserId) {
        console.log("No currentUserId, returning empty array");
        return [];
      }

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

      // Apply role-specific filters
      if (userRole === "tenant") {
        console.log("Applying tenant filter:", currentUserId);
        query = query.eq("tenant_id", currentUserId);
      } else if (userRole === "service_provider") {
        console.log("Applying service provider filter:", currentUserId);
        query = query.eq("assigned_to", currentUserId);
      } else if (userRole === "landlord") {
        console.log("Applying landlord filter - will be handled by RLS");
      }

      if (priority !== "all") {
        query = query.eq("priority", priority);
      }

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
    
    return maintenanceRequests.filter(request => 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [maintenanceRequests, searchQuery]);

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8 space-y-8">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold">
              {t("maintenance.myRequests")}
            </h1>
            <p className="text-gray-500">
              {t("maintenance.createAndTrack")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("maintenance.newRequest")}
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {t("maintenance.priority")}:
                </span>
                <Select
                  value={priority}
                  onValueChange={(value: Priority) => setPriority(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("maintenance.allPriorities")}</SelectItem>
                    <SelectItem value="low">{t("maintenance.priority.low")}</SelectItem>
                    <SelectItem value="medium">{t("maintenance.priority.medium")}</SelectItem>
                    <SelectItem value="high">{t("maintenance.priority.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder={t("maintenance.searchRequests")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <MaintenanceBoard
            requests={filteredRequests}
            isLoading={isLoading}
            onRequestClick={handleRequestClick}
          />

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