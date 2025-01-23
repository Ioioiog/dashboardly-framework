import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Property } from "@/utils/propertyUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileSchema } from "@/integrations/supabase/database-types/profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { TenantAssignConfirmDialog } from "./TenantAssignConfirmDialog";

const formSchema = z.object({
  propertyIds: z.array(z.string()).min(1, "Select at least one property"),
  tenantId: z.string().min(1, "Tenant is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

interface TenantAssignFormProps {
  properties: Property[];
  availableTenants: ProfileSchema["Tables"]["profiles"]["Row"][];
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export function TenantAssignForm({
  properties,
  availableTenants,
  onSubmit,
  isLoading,
}: TenantAssignFormProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyIds: [],
      tenantId: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
  });

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (formData) {
      onSubmit(formData);
      setShowConfirmDialog(false);
    }
  };

  const selectedTenant = availableTenants.find(
    tenant => tenant.id === form.watch("tenantId")
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                    {availableTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name}
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
            name="propertyIds"
            render={() => (
              <FormItem>
                <FormLabel>Properties</FormLabel>
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  {properties.map((property) => (
                    <FormField
                      key={property.id}
                      control={form.control}
                      name="propertyIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={property.id}
                            className="flex flex-row items-start space-x-3 space-y-0 py-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(property.id)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || [];
                                  if (checked) {
                                    field.onChange([...value, property.id]);
                                  } else {
                                    field.onChange(value.filter((id) => id !== property.id));
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium leading-none">
                                {property.name}
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {property.address}
                              </p>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </ScrollArea>
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
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
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
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Assigning..." : "Assign Tenant"}
          </Button>
        </form>
      </Form>

      <TenantAssignConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirm}
        tenant={selectedTenant}
        properties={properties}
        propertyIds={form.watch("propertyIds")}
        startDate={form.watch("startDate")}
        endDate={form.watch("endDate")}
      />
    </>
  );
}