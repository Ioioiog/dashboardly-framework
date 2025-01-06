import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const tenantFormSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().optional(),
  property_id: z.string().uuid(),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

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
}

export function TenantDialog({ properties, tenant }: TenantDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: tenant ? {
      email: tenant.email,
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      phone: tenant.phone || "",
      property_id: tenant.tenancy.property_id,
      start_date: tenant.tenancy.start_date,
      end_date: tenant.tenancy.end_date || "",
    } : {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      property_id: "",
      start_date: "",
      end_date: "",
    },
  });

  async function onSubmit(data: TenantFormValues) {
    try {
      if (tenant) {
        // Update existing tenant
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
          })
          .eq("id", tenant.id);

        if (profileError) throw profileError;

        const { error: tenancyError } = await supabase
          .from("tenancies")
          .update({
            property_id: data.property_id,
            start_date: data.start_date,
            end_date: data.end_date || null,
          })
          .eq("tenant_id", tenant.id);

        if (tenancyError) throw tenancyError;

        toast({
          title: "Success",
          description: "Tenant updated successfully",
        });
      } else {
        // Create new tenant
        const { data: authUser, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: Math.random().toString(36).slice(-8), // Generate random password
        });

        if (authError) throw authError;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            email: data.email,
          })
          .eq("id", authUser.user!.id);

        if (profileError) throw profileError;

        const { error: tenancyError } = await supabase
          .from("tenancies")
          .insert({
            tenant_id: authUser.user!.id,
            property_id: data.property_id,
            start_date: data.start_date,
            end_date: data.end_date || null,
          });

        if (tenancyError) throw tenancyError;

        toast({
          title: "Success",
          description: "Tenant added successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["tenants"] });
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
        <Button variant={tenant ? "outline" : "default"}>
          {tenant ? "Edit Tenant" : "Add Tenant"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit Tenant" : "Add New Tenant"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={!!tenant} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="property_id"
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
                          {property.name} - {property.address}
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
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {tenant ? "Update Tenant" : "Add Tenant"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}