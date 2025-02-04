import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaintenanceRequest {
  id?: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  images?: string[];
  notes?: string;
  assigned_to?: string;
  service_provider_notes?: string;
  service_provider_fee?: number;
  service_provider_status?: string;
  scheduled_date?: string | null;
  completion_report?: string;
}

export function useMaintenanceRequest(requestId?: string) {
  const queryClient = useQueryClient();

  // Query for fetching existing request
  const { data: existingRequest } = useQuery({
    queryKey: ['maintenance-request', requestId],
    enabled: !!requestId,
    queryFn: async () => {
      console.log("Fetching maintenance request with ID:", requestId);
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: MaintenanceRequest) => {
      console.log("Creating maintenance request with data:", data);
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([{
          ...data,
          scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString() : null,
          images: data.images?.filter(img => typeof img === 'string')
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<MaintenanceRequest>) => {
      if (!requestId) throw new Error('No request ID provided for update');
      console.log("Updating maintenance request with data:", data);

      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          ...data,
          scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString() : null,
          images: data.images?.filter(img => typeof img === 'string')
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    }
  });

  return {
    existingRequest,
    createMutation,
    updateMutation,
    isLoading: createMutation.isPending || updateMutation.isPending
  };
}