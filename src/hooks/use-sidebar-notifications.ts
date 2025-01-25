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
      
      const [maintenanceResponse, messagesResponse, paymentsResponse] = await Promise.all([
        // Get pending maintenance requests
        supabase
          .from("maintenance_requests")
          .select("id")
          .eq("status", "pending")
          .eq(
            "assigned_to",
            await supabase.auth.getUser().then(res => res.data.user?.id)
          ),
        
        // Get unread messages
        supabase
          .from("messages")
          .select("id")
          .eq("status", "sent")
          .eq(
            "receiver_id",
            await supabase.auth.getUser().then(res => res.data.user?.id)
          ),
        
        // Get pending payments
        supabase
          .from("payments")
          .select("id")
          .eq("status", "pending")
          .gte("due_date", new Date().toISOString())
      ]);

      console.log("Notifications fetched:", {
        maintenance: maintenanceResponse.data?.length,
        messages: messagesResponse.data?.length,
        payments: paymentsResponse.data?.length
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