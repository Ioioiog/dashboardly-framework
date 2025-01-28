import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { useAuthState } from "../useAuthState";
import { useUserRole } from "../use-user-role";

export function useMaintenanceRequests() {
  const { currentUserId } = useAuthState();
  const { userRole } = useUserRole();
  const queryClient = useQueryClient();

  console.log('[useMaintenanceRequests] Initializing with:', {
    currentUserId,
    userRole
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      console.log('[useMaintenanceRequests] Fetching maintenance requests for:', {
        currentUserId,
        userRole
      });
      
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

      // Add role-specific filters
      if (userRole === 'tenant') {
        console.log('[useMaintenanceRequests] Applying tenant filter');
        query.eq('tenant_id', currentUserId);
      } else if (userRole === 'landlord') {
        console.log('[useMaintenanceRequests] Applying landlord filter');
        query.eq('property.landlord_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useMaintenanceRequests] Error fetching requests:', error);
        throw error;
      }

      console.log('[useMaintenanceRequests] Successfully fetched requests:', {
        count: data?.length,
        firstRequest: data?.[0]?.id
      });

      return data as MaintenanceRequest[];
    },
    enabled: !!currentUserId && !!userRole,
  });

  const markAsRead = useMutation({
    mutationFn: async (requestId: string) => {
      console.log('[useMaintenanceRequests] Marking request as read:', {
        requestId,
        userRole
      });
      
      const updateData = userRole === 'landlord' 
        ? { read_by_landlord: true }
        : { read_by_tenant: true };

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('[useMaintenanceRequests] Error marking as read:', error);
        throw error;
      }

      console.log('[useMaintenanceRequests] Successfully marked as read');
    },
    onSuccess: () => {
      console.log('[useMaintenanceRequests] Invalidating queries after marking as read');
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sidebarNotifications'] });
    },
    onError: (error) => {
      console.error('[useMaintenanceRequests] Error in markAsRead mutation:', error);
    }
  });

  return {
    data,
    isLoading,
    error,
    markAsRead,
  };
}