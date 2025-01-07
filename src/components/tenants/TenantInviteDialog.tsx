import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/utils/propertyUtils";
import { format } from "date-fns";

const tenantFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  propertyId: z.string().uuid(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantInviteDialogProps {
  properties: Property[];
}

export function TenantInviteDialog({ properties }: TenantInviteDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Creating tenant account...");
      
      // Create the user account with a default password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: "Schimba1!", // Default password
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: 'tenant'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user account");

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      // Create the invitation record
      const { error: inviteError } = await supabase
        .from("tenant_invitations")
        .insert({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          property_id: data.propertyId,
          token,
          start_date: data.startDate,
          end_date: data.endDate,
        });

      if (inviteError) throw inviteError;

      // Send welcome email with login instructions
      const { error: emailError } = await supabase.functions.invoke("send-tenant-welcome", {
        body: {
          email: data.email,
          firstName: data.firstName,
          propertyName: properties.find(p => p.id === data.propertyId)?.name || "",
          temporaryPassword: "Schimba1!"
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: "Tenant account created and invitation sent successfully.",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating tenant account:", error);
      toast({
        title: "Error",
        description: "Failed to create tenant account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Tenant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Tenant Account</DialogTitle>
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
                    <Input placeholder="tenant@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
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
              name="lastName"
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}