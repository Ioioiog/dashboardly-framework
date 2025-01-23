import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCreateMaintenanceRequest } from "@/hooks/useCreateMaintenanceRequest";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaintenanceBasicInfo } from "./form/MaintenanceBasicInfo";
import { MaintenanceDescription } from "./form/MaintenanceDescription";
import { maintenanceFormSchema, MaintenanceFormValues } from "./types";
import { ImageUpload } from "./form/ImageUpload";
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MaintenanceFormProps {
  onSuccess: () => void;
  request?: MaintenanceRequest;
}

export function MaintenanceForm({ onSuccess, request }: MaintenanceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>(request?.images || []);
  const { mutate: createRequest, isPending: isCreating } = useCreateMaintenanceRequest();

  // Fetch user role
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      console.log("Fetching user profile...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      console.log("User profile fetched:", profile);
      return profile;
    }
  });

  // Fetch properties for landlord
  const { data: properties } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: async () => {
      console.log("Fetching landlord properties...");
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("landlord_id", userProfile?.id);
        
      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      console.log("Properties fetched:", data);
      return data;
    },
    enabled: userProfile?.role === "landlord",
  });

  const { mutate: updateRequest, isPending: isUpdating } = useMutation({
    mutationFn: async (values: MaintenanceFormValues) => {
      console.log("Updating maintenance request:", values);
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      // First, create a history record
      const { error: historyError } = await supabase
        .from("maintenance_request_history")
        .insert({
          maintenance_request_id: request!.id,
          title: request!.title,
          description: request!.description,
          issue_type: request!.issue_type,
          priority: request!.priority,
          notes: request!.notes,
          images: request!.images,
          edited_by: currentUser.user.id,
        });

      if (historyError) throw historyError;

      // Then update the request
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update({
          title: values.title,
          description: values.description,
          issue_type: values.issue_type,
          priority: values.priority,
          notes: values.notes,
          images: uploadedImages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
      onSuccess();
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

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: request?.title ?? "",
      description: request?.description ?? "",
      issue_type: request?.issue_type ?? "",
      priority: request?.priority ?? "",
      notes: request?.notes ?? "",
      property_id: request?.property_id ?? "",
    },
  });

  const onSubmit = async (values: MaintenanceFormValues) => {
    console.log("Form submitted with values:", values);
    
    if (request) {
      updateRequest(values);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error("No authenticated user found");
      toast({
        title: "Error",
        description: "You must be logged in to create a maintenance request",
        variant: "destructive",
      });
      return;
    }

    let propertyId = values.property_id;
    let tenantId = userData.user.id;
    
    // If user is a tenant, get their active tenancy's property
    if (userProfile?.role === "tenant") {
      console.log("Fetching active tenancy for tenant...");
      const { data: tenancy, error: tenancyError } = await supabase
        .from("tenancies")
        .select("property_id, tenant_id")
        .eq("tenant_id", userData.user.id)
        .eq("status", "active")
        .maybeSingle();

      if (tenancyError) {
        console.error("Error fetching tenancy:", tenancyError);
        toast({
          title: "Error",
          description: "Failed to fetch tenancy information",
          variant: "destructive",
        });
        return;
      }

      if (!tenancy) {
        console.error("No active tenancy found");
        toast({
          title: "Error",
          description: "You don't have an active tenancy. Please contact your landlord.",
          variant: "destructive",
        });
        return;
      }

      propertyId = tenancy.property_id;
      tenantId = tenancy.tenant_id;
    }

    console.log("Creating maintenance request with data:", {
      ...values,
      property_id: propertyId,
      tenant_id: tenantId,
      images: uploadedImages,
    });

    createRequest({
      title: values.title,
      description: values.description,
      property_id: propertyId,
      tenant_id: tenantId,
      issue_type: values.issue_type,
      priority: values.priority,
      notes: values.notes,
      images: uploadedImages,
    }, {
      onSuccess: () => {
        console.log("Maintenance request created successfully");
        toast({
          title: "Success",
          description: "Maintenance request created successfully",
        });
        onSuccess();
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {userProfile?.role === "landlord" && !request && (
          <FormField
            control={form.control}
            name="property_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        )}
        <MaintenanceBasicInfo form={form} />
        <MaintenanceDescription form={form} />
        <ImageUpload
          images={uploadedImages}
          onImagesChange={setUploadedImages}
          maxImages={5}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? request
              ? "Updating..."
              : "Creating..."
            : request
            ? "Update Request"
            : "Create Request"}
        </Button>
      </form>
    </Form>
  );
}