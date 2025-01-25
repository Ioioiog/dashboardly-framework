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
      
      // For testing purposes, return mock data
      const testData = [
        { type: "maintenance", count: 3 },
        { type: "messages", count: 5 },
        { type: "payments", count: 2 }
      ];

      console.log("Notifications fetched:", {
        maintenance: testData[0].count,
        messages: testData[1].count,
        payments: testData[2].count
      });

      // Comment out the actual data fetching for testing
      /*
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

      return [
        { type: "maintenance", count: maintenanceResponse.data?.length || 0 },
        { type: "messages", count: messagesResponse.data?.length || 0 },
        { type: "payments", count: paymentsResponse.data?.length || 0 }
      ] as Notification[];
      */

      return testData as Notification[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};