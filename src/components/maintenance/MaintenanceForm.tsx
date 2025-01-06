import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMaintenanceRequest } from "@/hooks/useCreateMaintenanceRequest";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceIssueType, MaintenancePriority } from "@/types/maintenance";

const maintenanceFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  issue_type: z.string().min(1, "Please select an issue type"),
  priority: z.string().min(1, "Please select a priority"),
  notes: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

const ISSUE_TYPES: MaintenanceIssueType[] = ['Plumbing', 'Electrical', 'HVAC', 'Structural', 'Appliance', 'Other'];
const PRIORITIES: MaintenancePriority[] = ['Low', 'Medium', 'High'];

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
      issue_type: "",
      priority: "",
      notes: "",
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

    const requestData = {
      title: values.title,
      description: values.description,
      property_id: tenancy.property_id,
      tenant_id: user.id,
      issue_type: values.issue_type,
      priority: values.priority,
      notes: values.notes,
    };

    createRequest(requestData, {
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
    });
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
          name="issue_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an issue type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ISSUE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
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
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information or special instructions"
                  className="min-h-[80px]"
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