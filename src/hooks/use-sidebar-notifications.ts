import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  type: string;
  count: number;
}

export const useSidebarNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("Fetching notifications...");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return [];
      }

      const [maintenanceResponse, messagesResponse, paymentsResponse] = await Promise.all([
        // Get pending maintenance requests
        supabase
          .from("maintenance_requests")
          .select("id")
          .eq("status", "pending")
          .eq("assigned_to", user.id),
        
        // Get unread messages
        supabase
          .from("messages")
          .select("id")
          .eq("status", "sent")
          .eq("receiver_id", user.id),
        
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
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};