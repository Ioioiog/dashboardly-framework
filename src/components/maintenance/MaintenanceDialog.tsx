import React, { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: string;
}

interface FormValues {
  title: string;
  description: string;
  property_id: string;
  priority: string;
  status: MaintenanceStatus;
  notes: string;
  assigned_to: string;
  service_provider_notes: string;
  images: File[] | string[];
  tenant_id: string;
}

interface MaintenanceRequest {
  title: string;
  description: string;
  property_id: string;
  priority: string;
  status: MaintenanceStatus;
  notes: string;
  assigned_to: string;
  service_provider_notes: string;
  images: string[];
  tenant_id: string;
}

export default function MaintenanceDialog({
  open,
  onOpenChange,
  requestId,
}: MaintenanceDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      property_id: "",
      priority: "low",
      status: "pending",
      notes: "",
      assigned_to: "",
      service_provider_notes: "",
      images: [],
      tenant_id: currentUserId || "",
    },
  });

  // Fetch existing request data if requestId is provided
  const { data: existingRequest } = useQuery({
    queryKey: ["maintenance-request", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("id", requestId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Load existing request data into form
  useEffect(() => {
    if (existingRequest) {
      form.reset(existingRequest);
    }
  }, [existingRequest, form]);

  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers"],
    enabled: userRole === "landlord",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "service_provider");
      if (error) throw error;
      return data;
    },
  });

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

  // Create new request
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
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
        notes: values.notes,
        assigned_to: values.assigned_to,
        service_provider_notes: values.service_provider_notes,
        images: imageUrls,
        tenant_id: values.tenant_id,
      };

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
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to create maintenance request",
        variant: "destructive",
      });
    },
  });

  // Update existing request
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
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
        notes: values.notes,
        assigned_to: values.assigned_to,
        service_provider_notes: values.service_provider_notes,
        images: imageUrls,
        tenant_id: values.tenant_id,
      };

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
        description: "Failed to update maintenance request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (requestId) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{t("maintenance.form.createRequest")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Tenant Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("maintenance.form.requestDetails")}</h3>
                <FormField
                  control={form.control}
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("maintenance.property")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole === "landlord"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties?.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={userRole === "landlord"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={userRole === "landlord"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole === "landlord"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            {t("maintenance.priority.low")}
                          </SelectItem>
                          <SelectItem value="medium">
                            {t("maintenance.priority.medium")}
                          </SelectItem>
                          <SelectItem value="high">
                            {t("maintenance.priority.high")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={userRole === "landlord"}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            onChange(files);
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Landlord Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("maintenance.form.landlordActions")}</h3>
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole !== "landlord"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole !== "landlord"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceProviders?.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {`${provider.first_name} ${provider.last_name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={userRole !== "landlord"}
                          placeholder="Add internal notes about this request"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_provider_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Provider Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={userRole !== "landlord"}
                          placeholder="Add instructions for the service provider"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {userRole === "landlord" ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
