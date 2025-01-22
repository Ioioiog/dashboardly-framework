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
        .select("tenant_id")
        .eq("status", "active");

      if (tenancyError) {
        console.error("Error fetching active tenancies:", tenancyError);
        throw tenancyError;
      }

      const activeTenantIds = activeTenancies?.map(t => t.tenant_id) || [];
      console.log("Active tenant IDs:", activeTenantIds);

      // Then fetch available tenants
      const query = supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, role, created_at, updated_at")
        .eq("role", "tenant");

      // Only add the not-in filter if there are active tenants
      if (activeTenantIds.length > 0) {
        query.not('id', 'in', `(${activeTenantIds.join(',')})`);
      }

      const { data: profiles, error } = await query;

      if (error) {
        console.error("Error fetching available tenants:", error);
        throw error;
      }

      console.log("Available tenants:", profiles);
      return profiles;
    },
    enabled: open,
  });

  const handleSubmit = async (data: any) => {
    try {
      console.log("Creating tenancies with data:", data);
      
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