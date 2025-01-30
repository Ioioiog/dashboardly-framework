import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface MaintenanceRequest {
  title: string;
  description: string;
  property_id: string;
  priority: string;
  status: MaintenanceStatus;
  notes: string;
  assigned_to: string | null;
  service_provider_notes: string;
  images: string[];
  tenant_id: string;
}

export function useMaintenanceRequest(requestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = useCallback(async (files: File[]) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('maintenance-images')
        .upload(fileName, file);
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('maintenance-images')
        .getPublicUrl(fileName);
        
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  }, []);

  const { data: existingRequest } = useQuery({
    queryKey: ["maintenance-request", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      if (!requestId) return null;
      
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      // Validate required fields
      if (!values.property_id || !values.tenant_id || !values.title || !values.description) {
        throw new Error("Required fields are missing");
      }

      let imageUrls: string[] = [];
      if (values.images?.length > 0 && values.images[0] instanceof File) {
        imageUrls = await handleImageUpload(values.images as File[]);
      }

      const newRequest: MaintenanceRequest = {
        title: values.title,
        description: values.description,
        property_id: values.property_id,
        priority: values.priority,
        status: values.status,
        notes: values.notes || "",
        assigned_to: values.assigned_to || null,
        service_provider_notes: values.service_provider_notes || "",
        images: imageUrls,
        tenant_id: values.tenant_id,
      };

      console.log("Creating maintenance request with data:", newRequest);

      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert(newRequest)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating maintenance request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create maintenance request",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!requestId) {
        throw new Error("Request ID is required for updates");
      }

      // Validate required fields
      if (!values.property_id || !values.tenant_id || !values.title || !values.description) {
        throw new Error("Required fields are missing");
      }

      let imageUrls: string[] = values.images as string[];
      if (values.images?.length > 0 && values.images[0] instanceof File) {
        imageUrls = await handleImageUpload(values.images as File[]);
      }

      const updatedRequest: MaintenanceRequest = {
        title: values.title,
        description: values.description,
        property_id: values.property_id,
        priority: values.priority,
        status: values.status,
        notes: values.notes || "",
        assigned_to: values.assigned_to || null,
        service_provider_notes: values.service_provider_notes || "",
        images: imageUrls,
        tenant_id: values.tenant_id,
      };

      console.log("Updating maintenance request with data:", updatedRequest);

      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(updatedRequest)
        .eq("id", requestId)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating maintenance request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update maintenance request",
        variant: "destructive",
      });
    },
  });

  return {
    existingRequest,
    createMutation,
    updateMutation,
  };
}