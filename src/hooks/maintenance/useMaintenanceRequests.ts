import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MaintenanceRequest } from "@/types/maintenance";
import { useUserRole } from "@/hooks/use-user-role";

export function useMaintenanceRequests() {
  const { toast } = useToast();
  const { userRole } = useUserRole();

  return useQuery({
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
          `)
          .order('created_at', { ascending: false });

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
}