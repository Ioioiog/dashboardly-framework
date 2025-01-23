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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

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

  const { data: tenantProperties } = useQuery({
    queryKey: ["tenant-properties", userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) {
        console.log("No user profile ID available");
        return null;
      }

      if (userProfile.role !== "tenant") {
        console.log("User is not a tenant");
        return null;
      }
      
      console.log("Fetching tenant's active properties for user:", userProfile.id);
      const { data, error } = await supabase
        .from("tenancies")
        .select(`
          property:properties(
            id,
            name,
            address
          )
        `)
        .eq("tenant_id", userProfile.id)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching tenant properties:", error);
        throw error;
      }

      const properties = data.map(item => item.property);
      console.log("Tenant properties fetched:", properties);
      return properties;
    },
    enabled: !!userProfile?.id && userProfile.role === "tenant"
  });

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: request?.title ?? "",
      description: request?.description ?? "",
      issue_type: request?.issue_type ?? "",
      priority: request?.priority ?? "",
      notes: request?.notes ?? "",
      property_id: request?.property_id ?? selectedPropertyId,
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

    // If user is a tenant and has multiple properties, ensure a property is selected
    if (userProfile.role === "tenant" && tenantProperties && tenantProperties.length > 1 && !selectedPropertyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a property for the maintenance request.",
      });
      return;
    }

    // Use the selected property ID or the property from the existing request
    const propertyId = request?.property_id || selectedPropertyId;
    if (!propertyId) {
      console.error("No property ID available");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a property for the maintenance request.",
      });
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
        {userProfile?.role === "tenant" && tenantProperties && tenantProperties.length > 1 && !request && (
          <div className="space-y-2">
            <Label htmlFor="property">Select Property</Label>
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {tenantProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
