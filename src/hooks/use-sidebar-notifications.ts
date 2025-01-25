import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useUserRole } from "@/hooks/use-user-role";

export interface Notification {
  type: string;
  count: number;
}

export const useSidebarNotifications = () => {
  const { isAuthenticated, currentUserId } = useAuthState();
  const { userRole } = useUserRole();

  return useQuery({
    queryKey: ["notifications", currentUserId, userRole],
    queryFn: async () => {
      if (!isAuthenticated || !currentUserId) {
        console.log("User not authenticated, skipping notifications fetch");
        return [];
      }

      console.log("Fetching notifications for user:", currentUserId, "with role:", userRole);
      
      const [maintenanceResponse, messagesResponse, paymentsResponse] = await Promise.all([
        // Get pending maintenance requests
        // For landlords: get requests for their properties
        // For tenants: get their own requests
        supabase
          .from("maintenance_requests")
          .select("id, property_id, tenant_id")
          .eq("status", "pending")
          .eq(userRole === "landlord" ? "assigned_to" : "tenant_id", currentUserId),
        
        // Get unread messages
        supabase
          .from("messages")
          .select("id")
          .eq("status", "sent")
          .eq("receiver_id", currentUserId),
        
        // Get pending payments based on role
        userRole === "landlord" 
          ? supabase
              .from("payments")
              .select("id, tenancy_id")
              .eq("status", "pending")
              .gte("due_date", new Date().toISOString())
          : supabase
              .from("payments")
              .select("id")
              .eq("status", "pending")
              .gte("due_date", new Date().toISOString())
              .in(
                "tenancy_id",
                `(SELECT id FROM tenancies WHERE tenant_id = '${currentUserId}' AND status = 'active')`
              )
      ]);

      console.log("Notifications fetched:", {
        maintenance: {
          count: maintenanceResponse.data?.length || 0,
          error: maintenanceResponse.error
        },
        messages: {
          count: messagesResponse.data?.length || 0,
          error: messagesResponse.error
        },
        payments: {
          count: paymentsResponse.data?.length || 0,
          error: paymentsResponse.error
        }
      });

      if (maintenanceResponse.error) {
        console.error("Maintenance fetch error:", maintenanceResponse.error);
      }
      if (messagesResponse.error) {
        console.error("Messages fetch error:", messagesResponse.error);
      }
      if (paymentsResponse.error) {
        console.error("Payments fetch error:", paymentsResponse.error);
      }

      return [
        { type: "maintenance", count: maintenanceResponse.data?.length || 0 },
        { type: "messages", count: messagesResponse.data?.length || 0 },
        { type: "payments", count: paymentsResponse.data?.length || 0 }
      ] as Notification[];
    },
    enabled: isAuthenticated && !!currentUserId && !!userRole,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};