import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";

export interface Notification {
  type: string;
  count: number;
}

export const useSidebarNotifications = () => {
  const { isAuthenticated, currentUserId } = useAuthState();

  return useQuery({
    queryKey: ["notifications", currentUserId],
    queryFn: async () => {
      if (!isAuthenticated || !currentUserId) {
        console.log("User not authenticated, skipping notifications fetch");
        return [];
      }

      console.log("Fetching notifications for user:", currentUserId);
      
      const [maintenanceResponse, messagesResponse, paymentsResponse] = await Promise.all([
        // Get pending maintenance requests
        supabase
          .from("maintenance_requests")
          .select("id")
          .eq("status", "pending")
          .eq("assigned_to", currentUserId),
        
        // Get unread messages
        supabase
          .from("messages")
          .select("id")
          .eq("status", "sent")
          .eq("receiver_id", currentUserId),
        
        // Get pending payments
        supabase
          .from("payments")
          .select("id")
          .eq("status", "pending")
          .gte("due_date", new Date().toISOString())
      ]);

      console.log("Notifications fetched:", {
        maintenance: maintenanceResponse.data?.length || 0,
        messages: messagesResponse.data?.length || 0,
        payments: paymentsResponse.data?.length || 0,
        maintenanceError: maintenanceResponse.error,
        messagesError: messagesResponse.error,
        paymentsError: paymentsResponse.error
      });

      return [
        { type: "maintenance", count: maintenanceResponse.data?.length || 0 },
        { type: "messages", count: messagesResponse.data?.length || 0 },
        { type: "payments", count: paymentsResponse.data?.length || 0 }
      ] as Notification[];
    },
    enabled: isAuthenticated && !!currentUserId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};