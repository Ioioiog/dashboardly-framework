import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Property } from "@/utils/propertyUtils";
import { TenantAssignForm } from "./TenantAssignForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TenantAssignDialogProps {
  properties: Property[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenantAssignDialog({ properties, open, onOpenChange }: TenantAssignDialogProps) {
  const { data: availableTenants = [] } = useQuery({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "tenant");

      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Existing Tenant</DialogTitle>
          <DialogDescription>
            Select a tenant and assign them to a property. This will create a new tenancy record.
          </DialogDescription>
        </DialogHeader>
        <TenantAssignForm 
          properties={properties} 
          availableTenants={availableTenants}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}