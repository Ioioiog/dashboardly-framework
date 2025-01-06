import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TenantFormValues } from "../TenantFormSchema";
import { verifyPropertyOwnership } from "./useCreateTenant";

export function useUpdateTenant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTenant = async (tenantId: string, data: TenantFormValues) => {
    console.log("Updating tenant:", tenantId, "with data:", data);
    
    // Get current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      throw new Error("Failed to verify user authentication");
    }

    // Verify property ownership
    await verifyPropertyOwnership(data.property_id, user.id);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      })
      .eq("id", tenantId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Updated profile for tenant:", tenantId);

    // Update tenancy
    const { error: tenancyError } = await supabase
      .from("tenancies")
      .update({
        property_id: data.property_id,
        start_date: data.start_date,
        end_date: data.end_date || null,
      })
      .eq("tenant_id", tenantId);

    if (tenancyError) {
      console.error("Error updating tenancy:", tenancyError);
      throw tenancyError;
    }

    console.log("Updated tenancy for tenant:", tenantId);

    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    toast({
      title: "Success",
      description: "Tenant updated successfully",
    });
  };

  return updateTenant;
}