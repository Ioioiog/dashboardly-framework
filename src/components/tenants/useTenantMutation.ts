import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TenantFormValues } from "./TenantFormSchema";

export function useTenantMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTenant = async (data: TenantFormValues) => {
    console.log("Creating new tenant with data:", data);
    
    // Create new user account
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: Math.random().toString(36).slice(-8), // Generate random password
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw authError;
    }

    console.log("Created auth user:", authUser);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
      })
      .eq("id", authUser.user!.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Updated profile for user:", authUser.user!.id);

    // Create tenancy
    const { error: tenancyError } = await supabase
      .from("tenancies")
      .insert({
        tenant_id: authUser.user!.id,
        property_id: data.property_id,
        start_date: data.start_date,
        end_date: data.end_date || null,
      });

    if (tenancyError) {
      console.error("Error creating tenancy:", tenancyError);
      throw tenancyError;
    }

    console.log("Created tenancy for user:", authUser.user!.id);

    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    toast({
      title: "Success",
      description: "Tenant added successfully",
    });
  };

  const updateTenant = async (tenantId: string, data: TenantFormValues) => {
    console.log("Updating tenant:", tenantId, "with data:", data);
    
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

  return {
    createTenant,
    updateTenant,
  };
}