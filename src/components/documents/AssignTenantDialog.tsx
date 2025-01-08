import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssignTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  propertyId: string | null;
  onAssigned: () => void;
}

export function AssignTenantDialog({ 
  open, 
  onOpenChange, 
  documentId, 
  propertyId,
  onAssigned 
}: AssignTenantDialogProps) {
  const { toast } = useToast();
  
  // Fetch tenants for the property if it exists
  const { data: tenants } = useQuery({
    queryKey: ["property-tenants", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from("tenancies")
        .select(`
          tenant_id,
          tenant:profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("property_id", propertyId)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });

  const handleAssignTenant = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ tenant_id: tenantId })
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document assigned successfully",
      });
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning document:", error);
      toast({
        title: "Error",
        description: "Could not assign the document",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Document to Tenant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select onValueChange={handleAssignTenant}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants?.map((tenant) => (
                <SelectItem key={tenant.tenant_id} value={tenant.tenant_id}>
                  {tenant.tenant.first_name} {tenant.tenant.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}