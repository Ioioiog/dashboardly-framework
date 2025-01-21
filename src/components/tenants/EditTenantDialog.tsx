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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface EditTenantDialogProps {
  tenant: Tenant;
  onUpdate: () => void;
}

export function EditTenantDialog({ tenant, onUpdate }: EditTenantDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      first_name: tenant.first_name || "",
      last_name: tenant.last_name || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      created_at: tenant.created_at ? format(new Date(tenant.created_at), 'yyyy-MM-dd') : "",
      updated_at: tenant.updated_at ? format(new Date(tenant.updated_at), 'yyyy-MM-dd') : "",
      start_date: tenant.tenancy.start_date ? format(new Date(tenant.tenancy.start_date), 'yyyy-MM-dd') : "",
      end_date: tenant.tenancy.end_date ? format(new Date(tenant.tenancy.end_date), 'yyyy-MM-dd') : "",
      propertyIds: [tenant.property.id],
    },
  });

  // Fetch available properties
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      console.log("Fetching properties for tenant edit...");
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address");

      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }

      console.log("Properties fetched:", data);
      return data;
    },
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("Updating tenant:", tenant.id, data);
      
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Profile updated successfully");

      // Update existing tenancy
      const { error: updateTenancyError } = await supabase
        .from('tenancies')
        .update({
          start_date: data.start_date,
          end_date: data.end_date || null,
        })
        .eq('tenant_id', tenant.id)
        .eq('property_id', tenant.property.id);

      if (updateTenancyError) {
        console.error("Error updating tenancy:", updateTenancyError);
        throw updateTenancyError;
      }

      console.log("Tenancy updated successfully");

      // Add new tenancies for additional properties
      const newProperties = data.propertyIds.filter((id: string) => id !== tenant.property.id);
      if (newProperties.length > 0) {
        const newTenancies = newProperties.map((propertyId: string) => ({
          tenant_id: tenant.id,
          property_id: propertyId,
          start_date: data.start_date,
          end_date: data.end_date || null,
          status: 'active',
        }));

        const { error: newTenancyError } = await supabase
          .from('tenancies')
          .insert(newTenancies);

        if (newTenancyError) {
          console.error("Error creating new tenancies:", newTenancyError);
          throw newTenancyError;
        }

        console.log("New tenancies created successfully");
      }

      toast({
        title: "Success",
        description: "Tenant information updated successfully",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      
      setOpen(false);
      // Call onUpdate to refresh the tenant list
      onUpdate();
    } catch (error: any) {
      console.error("Error updating tenant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tenant information",
        variant: "destructive",
      });
    }
  };

  const propertyIds = watch('propertyIds');

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
            <Label>Properties</Label>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {properties.map((property) => (
                <div key={property.id} className="flex items-start space-x-3 py-2">
                  <Checkbox
                    id={`property-${property.id}`}
                    checked={propertyIds?.includes(property.id)}
                    onCheckedChange={(checked) => {
                      const currentIds = propertyIds || [];
                      const newIds = checked
                        ? [...currentIds, property.id]
                        : currentIds.filter(id => id !== property.id);
                      setValue('propertyIds', newIds);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={`property-${property.id}`} className="text-sm font-medium leading-none">
                      {property.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {property.address}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
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