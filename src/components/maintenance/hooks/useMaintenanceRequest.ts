import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id?: string;
  property_id?: string;
  tenant_id?: string;
  title?: string;
  description?: string;
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

export function useMaintenanceRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMaintenanceRequest = async (data: MaintenanceRequest) => {
    setIsLoading(true);
    try {
      console.log("Creating maintenance request with data:", data);

      // Transform the data to ensure scheduled_date is a string
      const transformedData = {
        ...data,
        scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString() : null,
      };

      const { error } = await supabase
        .from("maintenance_requests")
        .insert([transformedData]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
    } catch (error: any) {
      console.error("Error creating maintenance request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMaintenanceRequest = async (id: string, data: Partial<MaintenanceRequest>) => {
    setIsLoading(true);
    try {
      console.log("Updating maintenance request:", id, data);

      // Transform the data to ensure scheduled_date is a string
      const transformedData = {
        ...data,
        scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString() : null,
      };

      const { error } = await supabase
        .from("maintenance_requests")
        .update(transformedData)
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating maintenance request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMaintenanceRequest = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting maintenance request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete maintenance request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
  };
}