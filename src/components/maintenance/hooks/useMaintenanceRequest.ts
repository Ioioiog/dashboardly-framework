import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { MaintenanceRequestFormData, MaintenanceStatus, validateMaintenanceRequest } from "../utils/validation";

export function useMaintenanceRequest(requestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = useCallback(async (files: File[]) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log(`Attempting to upload file: ${fileName}`);
      
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
        
      console.log(`Generated public URL: ${publicUrl}`);
      uploadedUrls.push(publicUrl);
    }
    
    console.log('Generated image URLs:', uploadedUrls);
    return uploadedUrls;
  }, []);

  const { data: existingRequest } = useQuery({
    queryKey: ["maintenance-request", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      if (!requestId) return null;
      
      console.log(`Fetching maintenance request with ID: ${requestId}`);
      
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching maintenance request:', error);
        throw error;
      }
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: MaintenanceRequestFormData) => {
      console.log("Creating maintenance request with data:", values);

      // Handle image uploads if there are any new files
      let imageUrls: string[] = [];
      if (values.images?.length > 0) {
        const filesToUpload = values.images.filter((img): img is File => img instanceof File);
        const existingUrls = values.images.filter((img): img is string => typeof img === 'string');
        
        if (filesToUpload.length > 0) {
          const uploadedUrls = await handleImageUpload(filesToUpload);
          imageUrls = [...existingUrls, ...uploadedUrls];
        } else {
          imageUrls = existingUrls;
        }
      }

      // Transform the data for Supabase
      const transformedData = {
        ...values,
        images: imageUrls,
        scheduled_date: values.scheduled_date?.toISOString(),
        property_id: values.property_id,
        description: values.description,
        status: values.status || 'pending' as MaintenanceStatus,
        priority: values.priority || 'low'
      };

      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert(transformedData)
        .select();

      if (error) {
        console.error("Error creating maintenance request:", error);
        throw error;
      }
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
    mutationFn: async (values: MaintenanceRequestFormData) => {
      if (!requestId) {
        throw new Error("Request ID is required for updates");
      }

      console.log("Updating maintenance request with data:", values);

      // Handle image uploads if there are any new files
      let imageUrls: string[] = [];
      if (values.images?.length > 0) {
        const filesToUpload = values.images.filter((img): img is File => img instanceof File);
        const existingUrls = values.images.filter((img): img is string => typeof img === 'string');
        
        if (filesToUpload.length > 0) {
          const uploadedUrls = await handleImageUpload(filesToUpload);
          imageUrls = [...existingUrls, ...uploadedUrls];
        } else {
          imageUrls = existingUrls;
        }
      }

      // Transform the data for Supabase
      const transformedData = {
        ...values,
        images: imageUrls,
        scheduled_date: values.scheduled_date?.toISOString(),
        property_id: values.property_id,
        description: values.description,
        status: values.status || 'pending' as MaintenanceStatus,
        priority: values.priority || 'low'
      };

      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(transformedData)
        .eq("id", requestId)
        .select();

      if (error) {
        console.error("Error updating maintenance request:", error);
        throw error;
      }
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