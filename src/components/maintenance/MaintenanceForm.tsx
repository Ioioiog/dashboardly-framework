import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceBasicInfo } from "./form/MaintenanceBasicInfo";
import { MaintenanceDescription } from "./form/MaintenanceDescription";
import { maintenanceFormSchema, MaintenanceFormValues } from "./types";
import { ImageUpload } from "./form/ImageUpload";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertySelect } from "./form/PropertySelect";
import { useMaintenanceFormSubmit } from "@/hooks/useMaintenanceFormSubmit";
import { MaintenanceRequest } from "@/types/maintenance";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MaintenanceFormProps {
  onSuccess: () => void;
  request?: MaintenanceRequest;
}

export function MaintenanceForm({ onSuccess, request }: MaintenanceFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(request?.images || []);
  const { handleSubmit: submitForm, isSubmitting } = useMaintenanceFormSubmit(onSuccess);
  const navigate = useNavigate();

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Session error:", error);
        navigate("/auth");
        return;
      }
    };
    
    checkSession();
  }, [navigate]);

  const { data: userProfile, isError: isProfileError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      console.log("Fetching user profile...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw userError;
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      console.log("User profile fetched:", profile);
      return profile;
    },
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error("Error in profile query:", error);
        navigate("/auth");
      }
    }
  });

  // Fetch tenant's active property if they're a tenant
  const { data: tenantProperty } = useQuery({
    queryKey: ["tenant-property", userProfile?.id],
    queryFn: async () => {
      if (userProfile?.role !== "tenant") return null;
      
      console.log("Fetching tenant's active property...");
      const { data, error } = await supabase
        .from("tenancies")
        .select(`
          property_id,
          properties (
            id,
            name
          )
        `)
        .eq("tenant_id", userProfile.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error("Error fetching tenant property:", error);
        throw error;
      }

      console.log("Tenant property fetched:", data);
      return data?.properties;
    },
    enabled: !!userProfile && userProfile.role === "tenant"
  });

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
    enabled: !!userProfile && userProfile?.role === "landlord",
  });

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: request?.title ?? "",
      description: request?.description ?? "",
      issue_type: request?.issue_type ?? "",
      priority: request?.priority ?? "",
      notes: request?.notes ?? "",
      property_id: request?.property_id ?? tenantProperty?.id ?? "",
    },
  });

  const onSubmit = async (values: MaintenanceFormValues) => {
    // If user is a tenant, use their active property
    const propertyId = userProfile?.role === "tenant" ? tenantProperty?.id : values.property_id;
    if (!propertyId) {
      console.error("No property ID available");
      return;
    }
    await submitForm(values, uploadedImages, propertyId);
  };

  if (isProfileError) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {userProfile?.role === "landlord" && !request && (
          <PropertySelect form={form} properties={properties || []} />
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
          disabled={isSubmitting}
          variant="default"
          size="lg"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
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