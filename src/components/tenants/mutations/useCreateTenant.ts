import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TenantFormValues } from "../TenantFormSchema";

export async function verifyPropertyOwnership(propertyId: string, userId: string) {
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id, name")
    .eq("id", propertyId)
    .single();

  if (propertyError) {
    console.error("Error verifying property ownership:", propertyError);
    throw new Error("Failed to verify property ownership");
  }

  if (property.landlord_id !== userId) {
    console.error("User does not own this property");
    throw new Error("You can only assign tenants to properties you own");
  }

  return property;
}

export function useCreateTenant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTenant = async (data: TenantFormValues) => {
    console.log("Starting tenant invitation process with data:", data);
    
    // Get current user's ID to verify they own the property
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      throw new Error("Failed to verify user authentication");
    }

    // Verify property ownership and get property details
    const property = await verifyPropertyOwnership(data.property_id, user.id);

    // Send invitation email
    const response = await fetch('/functions/v1/send-tenant-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: data.email,
        propertyId: data.property_id,
        propertyName: property.name,
        startDate: data.start_date,
        endDate: data.end_date,
        firstName: data.first_name,
        lastName: data.last_name,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending invitation:", error);
      throw new Error("Failed to send tenant invitation");
    }

    console.log("Completed tenant invitation process");

    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    toast({
      title: "Success",
      description: "Invitation sent successfully. The tenant will receive an email to set up their account.",
    });
  };

  return createTenant;
}