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
        .insert([{
          ...data,
          status: data.status || 'pending',
          priority: data.priority || 'low',
          scheduled_date: data.scheduled_date || null,
          images: data.images || [],
          service_provider_fee: data.service_provider_fee || 0,
          payment_amount: data.payment_amount || 0
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<MaintenanceRequest>) => {
      if (!requestId) throw new Error('No request ID provided for update');
      console.log("Updating maintenance request with data:", data);

      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          ...data,
          scheduled_date: data.scheduled_date || null,
          images: data.images,
          service_provider_fee: data.service_provider_fee ?? undefined,
          payment_amount: data.payment_amount ?? undefined
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