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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
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

  const checkTenancyOverlap = async (propertyId: string, startDate: string, endDate?: string) => {
    try {
      console.log("Checking tenancy overlap for:", { propertyId, startDate, endDate });
      
      let query = supabase
        .from('tenancies')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active');

      if (endDate) {
        // For fixed-term tenancies
        query = query.or(`start_date.lte.${endDate},end_date.gte.${startDate},end_date.is.null`);
      } else {
        // For indefinite tenancies
        query = query.or(`start_date.lte.${startDate},end_date.is.null,end_date.gte.${startDate}`);
      }

      const { data: overlappingTenancies, error } = await query;

      if (error) {
        console.error("Error checking tenancy overlap:", error);
        throw error;
      }

      console.log("Overlapping tenancies found:", overlappingTenancies);
      return overlappingTenancies && overlappingTenancies.length > 0;
    } catch (error) {
      console.error("Error in checkTenancyOverlap:", error);
      throw error;
    }
  };

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      for (const propertyId of data.propertyIds) {
        const hasOverlap = await checkTenancyOverlap(propertyId, data.startDate, data.endDate);
        
        if (hasOverlap) {
          const property = properties.find(p => p.id === propertyId);
          toast({
            title: "Tenancy Overlap Detected",
            description: `${property?.name} already has an active tenancy during this period. Please adjust the dates or select a different property.`,
            variant: "destructive",
          });
          return;
        }
      }

      setFormData(data);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to validate tenancy dates. Please try again.",
        variant: "destructive",
      });
    }
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
