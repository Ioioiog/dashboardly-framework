import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaintenanceRequest {
  id?: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  images: string[];
  notes?: string | null;
  assigned_to?: string | null;
  service_provider_notes?: string | null;
  read_by_landlord?: boolean;
  read_by_tenant?: boolean;
  service_provider_fee?: number;
  service_provider_status?: string | null;
  scheduled_date?: string | null;
  completion_report?: string | null;
  completion_date?: string | null;
  payment_status?: string | null;
  payment_amount?: number;
  cost_estimate?: number | null;
  rating_comment?: string | null;
}

export function useMaintenanceRequest(requestId?: string) {
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: async (data: MaintenanceRequest) => {
      console.log("Creating maintenance request with data:", data);
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: MaintenanceRequest) => {
      if (!requestId) throw new Error('No request ID provided for update');
      console.log("Updating maintenance request with data:", data);

      const { error } = await supabase
        .from('maintenance_requests')
        .update(data)
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