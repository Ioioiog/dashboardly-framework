import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/utils/propertyUtils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const assignTenantSchema = z.object({
  propertyId: z.string().min(1, "Please select a property"),
  tenantId: z.string().min(1, "Please select a tenant"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

interface TenantAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
}

export function TenantAssignDialog({ open, onOpenChange, properties }: TenantAssignDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof assignTenantSchema>>({
    resolver: zodResolver(assignTenantSchema),
    defaultValues: {
      propertyId: "",
      tenantId: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const { data: availableTenants } = useQuery({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      console.log("Fetching available tenants");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("role", "tenant")
        .not("id", "in", (
          await supabase
            .from("tenancies")
            .select("tenant_id")
            .eq("status", "active")
        ).data?.map(t => t.tenant_id) || []);

      if (error) {
        console.error("Error fetching available tenants:", error);
        throw error;
      }

      console.log("Available tenants:", profiles);
      return profiles;
    },
    enabled: open,
  });

  const onSubmit = async (values: z.infer<typeof assignTenantSchema>) => {
    try {
      console.log("Assigning tenant with values:", values);

      const { error } = await supabase
        .from("tenancies")
        .insert({
          property_id: values.propertyId,
          tenant_id: values.tenantId,
          start_date: values.startDate,
          end_date: values.endDate || null,
          status: "active",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant assigned successfully",
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error assigning tenant:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign tenant. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Tenant to Property</DialogTitle>
          <DialogDescription>
            Select a property and tenant to create a new tenancy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTenants?.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.first_name} {tenant.last_name} ({tenant.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Assign Tenant
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}