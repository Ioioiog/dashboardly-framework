import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceBasicInfo } from "./form/MaintenanceBasicInfo";
import { MaintenanceDescription } from "./form/MaintenanceDescription";
import { maintenanceFormSchema, MaintenanceFormValues } from "./types";
import { ImageUpload } from "./form/ImageUpload";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertySelect } from "./form/PropertySelect";
import { useMaintenanceFormSubmit } from "@/hooks/useMaintenanceFormSubmit";
import { MaintenanceRequest } from "@/types/maintenance";

interface MaintenanceFormProps {
  onSuccess: () => void;
  request?: MaintenanceRequest;
}

export function MaintenanceForm({ onSuccess, request }: MaintenanceFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(request?.images || []);
  const { handleSubmit: submitForm, isSubmitting } = useMaintenanceFormSubmit(onSuccess);

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
    await submitForm(values, uploadedImages);
  };

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
        >
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