import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceBasicInfo } from "./form/MaintenanceBasicInfo";
import { MaintenanceDescription } from "./form/MaintenanceDescription";
import { ImageUpload } from "./form/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useMaintenanceFormSubmit } from "@/hooks/useMaintenanceFormSubmit";
import { MaintenanceRequest } from "@/types/maintenance";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceFormSchema, MaintenanceFormValues } from "./types";

interface MaintenanceFormProps {
  onSuccess: () => void;
  request?: MaintenanceRequest;
}

export function MaintenanceForm({ onSuccess, request }: MaintenanceFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(request?.images || []);
  const { handleSubmit: submitForm, isSubmitting } = useMaintenanceFormSubmit(onSuccess);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Session error:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to continue.",
        });
        navigate("/auth");
        return;
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const { data: userProfile, isError: isProfileError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      console.log("Fetching user profile...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        throw new Error("Not authenticated");
      }
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      if (!profile) {
        console.error("No profile found");
        throw new Error("Profile not found");
      }
      
      console.log("User profile fetched:", profile);
      return profile;
    },
    retry: 1,
    enabled: true
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
    if (!userProfile) {
      console.error("No user profile available");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to submit a maintenance request.",
      });
      return;
    }

    await submitForm(values, uploadedImages, values.property_id);
  };

  if (isProfileError) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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