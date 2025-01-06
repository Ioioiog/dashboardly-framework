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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', data.email)
      .single();

    let tenantId: string;

    if (existingUser) {
      console.log("User already exists:", existingUser);
      
      if (existingUser.role !== 'tenant') {
        throw new Error("This user exists but is not a tenant");
      }
      
      tenantId = existingUser.id;
    } else {
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
      tenantId = authUser.user!.id;

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
        .eq("id", tenantId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Updated profile for user:", tenantId);
    }

    // Check if tenant already has an active tenancy
    const { data: existingTenancy, error: tenancyCheckError } = await supabase
      .from("tenancies")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .single();

    if (tenancyCheckError && tenancyCheckError.code !== "PGRST116") { // PGRST116 means no rows returned
      console.error("Error checking existing tenancy:", tenancyCheckError);
      throw tenancyCheckError;
    }

    if (existingTenancy) {
      throw new Error("This tenant already has an active tenancy");
    }

    // Create tenancy relationship
    const { error: tenancyError } = await supabase
      .from("tenancies")
      .insert({
        tenant_id: tenantId,
        property_id: data.property_id,
        start_date: data.start_date,
        end_date: data.end_date || null,
        status: 'active'
      });

    if (tenancyError) {
      console.error("Error creating tenancy:", tenancyError);
      throw tenancyError;
    }

    console.log("Created tenancy for user:", tenantId);

    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    toast({
      title: "Success",
      description: existingUser 
        ? "Tenant assigned successfully" 
        : "Tenant added successfully. They will receive an email to set their password.",
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
