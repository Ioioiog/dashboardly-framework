import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TenantFormValues } from "./TenantFormSchema";

export function useTenantMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTenant = async (data: TenantFormValues) => {
    console.log("Creating new tenant with data:", data);
    
    // First verify that the landlord owns the property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", data.property_id)
      .single();

    if (propertyError) {
      console.error("Error verifying property ownership:", propertyError);
      throw new Error("Failed to verify property ownership");
    }

    // Get current user's ID to verify they own the property
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      throw new Error("Failed to verify user authentication");
    }

    if (property.landlord_id !== user.id) {
      console.error("User does not own this property");
      throw new Error("You can only assign tenants to properties you own");
    }

    // Create new user account for tenant
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: Math.random().toString(36).slice(-8), // Generate random password
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw authError;
    }

    console.log("Created auth user:", authUser);

    // Update profile for the new tenant
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        role: 'tenant'
      })
      .eq("id", authUser.user!.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Updated profile for user:", authUser.user!.id);

    // Create tenancy relationship
    const { error: tenancyError } = await supabase
      .from("tenancies")
      .insert({
        tenant_id: authUser.user!.id,
        property_id: data.property_id,
        start_date: data.start_date,
        end_date: data.end_date || null,
        status: 'active'
      });

    if (tenancyError) {
      console.error("Error creating tenancy:", tenancyError);
      throw tenancyError;
    }

    console.log("Created tenancy for user:", authUser.user!.id);

    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    toast({
      title: "Success",
      description: "Tenant added successfully. They will receive an email to set their password.",
    });
  };

  const updateTenant = async (tenantId: string, data: TenantFormValues) => {
    console.log("Updating tenant:", tenantId, "with data:", data);
    
    // Verify property ownership first
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", data.property_id)
      .single();

    if (propertyError) {
      console.error("Error verifying property ownership:", propertyError);
      throw new Error("Failed to verify property ownership");
    }

    // Get current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      throw new Error("Failed to verify user authentication");
    }

    if (property.landlord_id !== user.id) {
      console.error("User does not own this property");
      throw new Error("You can only update tenants for properties you own");
    }

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