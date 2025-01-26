import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { useAuthState } from "../useAuthState";
import { useUserRole } from "../use-user-role";

export function useMaintenanceRequests() {
  const { currentUserId } = useAuthState();
  const { userRole } = useUserRole();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      console.log('Fetching maintenance requests for user:', currentUserId, 'role:', userRole);
      
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

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching maintenance requests:', error);
        throw error;
      }

      console.log('Fetched maintenance requests:', data);
      return data as MaintenanceRequest[];
    },
    enabled: !!currentUserId,
  });

  const markAsRead = useMutation({
    mutationFn: async (requestId: string) => {
      console.log('Marking maintenance request as read:', requestId);
      const updateData = userRole === 'landlord' 
        ? { read_by_landlord: true }
        : { read_by_tenant: true };

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error marking request as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate both maintenance requests and sidebar notifications
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sidebarNotifications'] });
    },
  });

  return {
    data,
    isLoading,
    error,
    markAsRead,
  };
}