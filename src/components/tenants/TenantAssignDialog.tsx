import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantAssignForm } from "./TenantAssignForm";
import { tenantAuditService } from "@/services/tenantAuditService";

interface TenantAssignDialogProps {
  properties: Property[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenantAssignDialog({ properties, open, onOpenChange }: TenantAssignDialogProps) {
  const { toast } = useToast();

  const { data: availableTenants, isLoading } = useQuery({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      console.log("Fetching available tenants");
      
      try {
        // First get all active tenancy tenant IDs
        const { data: activeTenancies, error: tenancyError } = await supabase
          .from("tenancies")
          .select("tenant_id")
          .eq("status", "active");

        if (tenancyError) {
          console.error("Error fetching active tenancies:", tenancyError);
          throw tenancyError;
        }

        // Get all tenant profiles that have the 'tenant' role
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone, role, created_at, updated_at")
          .eq("role", "tenant");

        if (profileError) {
          console.error("Error fetching tenant profiles:", profileError);
          throw profileError;
        }

        // Filter out tenants who have active tenancies
        const activeTenantIds = activeTenancies?.map(t => t.tenant_id) || [];
        const availableTenants = profiles.filter(profile => !activeTenantIds.includes(profile.id));

        console.log("Available tenants:", availableTenants);
        return availableTenants;
      } catch (error) {
        console.error("Error fetching available tenants:", error);
        throw new Error("Failed to fetch available tenants");
      }
    },
    enabled: open,
  });

  const handleSubmit = async (data: any) => {
    try {
      console.log("Creating tenancies with data:", data);
      
      // First verify the tenant exists in profiles
      const { data: tenantProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.tenantId)
        .single();

      if (profileError || !tenantProfile) {
        console.error("Error verifying tenant profile:", profileError);
        throw new Error("Selected tenant profile not found");
      }

      // Get current user (landlord) ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      // Create tenancies for each selected property
      const tenancyPromises = data.propertyIds.map(async (propertyId: string) => {
        const { error: tenancyError } = await supabase
          .from('tenancies')
          .insert({
            property_id: propertyId,
            tenant_id: data.tenantId,
            start_date: data.startDate,
            end_date: data.endDate || null,
            status: 'active'
          });

        if (tenancyError) {
          console.error("Error creating tenancy:", tenancyError);
          throw new Error(`Failed to create tenancy for property ${propertyId}`);
        }
      });

      await Promise.all(tenancyPromises);

      // Log the tenant assignment
      await tenantAuditService.logTenantAction({
        action_type: 'tenant_assigned',
        landlord_id: user.id,
        tenant_id: data.tenantId,
        property_ids: data.propertyIds,
        metadata: {
          start_date: data.startDate,
          end_date: data.endDate
        }
      });

      toast({
        title: "Success",
        description: "Tenant assigned successfully to selected properties.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to assign tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Tenant to Properties</DialogTitle>
        </DialogHeader>
        <TenantAssignForm 
          properties={properties}
          availableTenants={availableTenants || []}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}