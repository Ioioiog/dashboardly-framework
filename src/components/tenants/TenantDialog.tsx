import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TenantForm } from "./TenantForm";
import { useTenantMutation } from "./useTenantMutation";
import type { TenantFormValues } from "./TenantFormSchema";

interface TenantDialogProps {
  properties: Array<{
    id: string;
    name: string;
    address: string;
  }>;
  tenant?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    tenancy: {
      property_id: string;
      start_date: string;
      end_date?: string;
    };
  };
  children: React.ReactNode;
}

export function TenantDialog({ properties, tenant, children }: TenantDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { createTenant, updateTenant } = useTenantMutation();

  async function onSubmit(data: TenantFormValues) {
    try {
      if (tenant) {
        await updateTenant(tenant.id, data);
        toast({
          title: "Success",
          description: "Tenant updated successfully.",
        });
      } else {
        await createTenant(data);
        toast({
          title: "Success",
          description: "Invitation sent successfully. The tenant will receive an email to set up their account.",
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Error managing tenant:", error);
      toast({
        title: "Error",
        description: "Failed to manage tenant. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit Tenant" : "Add New Tenant"}</DialogTitle>
        </DialogHeader>
        <TenantForm
          onSubmit={onSubmit}
          properties={properties}
          tenant={tenant}
        />
      </DialogContent>
    </Dialog>
  );
}