import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMaintenanceRequest } from "@/hooks/useCreateMaintenanceRequest";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const maintenanceFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  onSuccess: () => void;
}

export function MaintenanceForm({ onSuccess }: MaintenanceFormProps) {
  const { toast } = useToast();
  const { mutate: createRequest, isPending } = useCreateMaintenanceRequest();

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: MaintenanceFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a maintenance request",
        variant: "destructive",
      });
      return;
    }

    // Get the user's active tenancy to get the property_id
    const { data: tenancy, error: tenancyError } = await supabase
      .from("tenancies")
      .select("property_id")
      .eq("tenant_id", user.id)
      .eq("status", "active")
      .single();

    if (tenancyError || !tenancy) {
      toast({
        title: "Error",
        description: "Could not find your active tenancy",
        variant: "destructive",
      });
      return;
    }

    createRequest(
      {
        ...values,
        property_id: tenancy.property_id,
        tenant_id: user.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Maintenance request created successfully",
          });
          onSuccess();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to create maintenance request",
            variant: "destructive",
          });
          console.error("Error creating maintenance request:", error);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the issue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the maintenance issue"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating..." : "Create Request"}
        </Button>
      </form>
    </Form>
  );
}