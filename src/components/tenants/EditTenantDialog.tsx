import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tenant } from "@/types/tenant";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditTenantDialogProps {
  tenant: Tenant;
  onUpdate: () => void;
}

export function EditTenantDialog({ tenant, onUpdate }: EditTenantDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, formState: { isSubmitting }, setValue, watch } = useForm({
    defaultValues: {
      first_name: tenant.first_name || "",
      last_name: tenant.last_name || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      role: tenant.role || "tenant",
      created_at: tenant.created_at ? format(new Date(tenant.created_at), 'yyyy-MM-dd') : "",
      updated_at: tenant.updated_at ? format(new Date(tenant.updated_at), 'yyyy-MM-dd') : "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("Updating tenant:", tenant.id, data);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          role: data.role,
        })
        .eq('id', tenant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant information updated successfully",
      });
      
      setOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Error updating tenant:", error);
      toast({
        title: "Error",
        description: "Failed to update tenant information",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tenant Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...register("first_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...register("last_name")} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              onValueChange={(value) => setValue("role", value)} 
              defaultValue={watch("role")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="created_at">Created At</Label>
              <Input id="created_at" {...register("created_at")} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated_at">Updated At</Label>
              <Input id="updated_at" {...register("updated_at")} disabled />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}