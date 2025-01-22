import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantAssignForm } from "./TenantAssignForm";

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
      
      // First get all active tenancy tenant IDs
      const { data: activeTenancies, error: tenancyError } = await supabase
        .from("tenancies")
        .select(`
          tenant_id,
          property_id,
          start_date,
          end_date
        `)
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

      // Filter out tenants who have active tenancies with overlapping dates
      const availableTenants = profiles.filter(profile => {
        // Check if tenant has any active tenancies
        const tenantTenancies = activeTenancies?.filter(t => t.tenant_id === profile.id) || [];
        
        // If tenant has no tenancies, they are available
        if (tenantTenancies.length === 0) {
          return true;
        }

        // Check for each tenancy if it's currently active (no end date or end date in future)
        const hasActiveOverlappingTenancy = tenantTenancies.some(tenancy => {
          const today = new Date();
          const endDate = tenancy.end_date ? new Date(tenancy.end_date) : null;
          
          // If there's no end date or the end date is in the future, tenant is not available
          return !endDate || endDate > today;
        });

        // Tenant is available if they don't have any active overlapping tenancies
        return !hasActiveOverlappingTenancy;
      });

      console.log("Available tenants:", availableTenants);
      return availableTenants;
    },
    enabled: open,
  });

  const handleSubmit = async (data: any) => {
    try {
      console.log("Creating tenancies with data:", data);
      
      // Additional validation before creating tenancies
      const { data: existingTenancies, error: validationError } = await supabase
        .from("tenancies")
        .select("*")
        .eq("tenant_id", data.tenantId)
        .eq("status", "active")
        .overlaps("start_date", data.startDate, data.endDate || "infinity");

      if (validationError) {
        throw validationError;
      }

      if (existingTenancies && existingTenancies.length > 0) {
        toast({
          title: "Error",
          description: "This tenant already has an active tenancy during the selected period.",
          variant: "destructive",
        });
        return;
      }

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
          throw tenancyError;
        }
      });

      await Promise.all(tenancyPromises);

      toast({
        title: "Success",
        description: "Tenant assigned successfully to selected properties.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to assign tenant. Please try again.",
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