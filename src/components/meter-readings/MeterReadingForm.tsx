import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { format } from "date-fns";

interface MeterReadingFormProps {
  properties: Property[];
  onSuccess: () => void;
  userRole: "landlord" | "tenant";
  userId: string | null;
}

interface FormData {
  property_id: string;
  reading_type: 'electricity' | 'water' | 'gas';
  reading_value: number;
  reading_date: string;
  notes?: string;
}

export function MeterReadingForm({
  properties,
  onSuccess,
  userRole,
  userId
}: MeterReadingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      reading_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting meter reading:", data);

      // Get tenant ID for the selected property if landlord is submitting
      let tenant_id = userId;
      if (userRole === 'landlord') {
        const { data: tenancy, error: tenancyError } = await supabase
          .from('tenancies')
          .select('tenant_id')
          .eq('property_id', data.property_id)
          .eq('status', 'active')
          .single();

        if (tenancyError) {
          console.error("Error fetching tenant:", tenancyError);
          throw new Error("Could not find active tenant for this property");
        }
        tenant_id = tenancy.tenant_id;
      }

      const { error: insertError } = await supabase
        .from('meter_readings')
        .insert({
          ...data,
          tenant_id,
          created_by: userId,
          updated_by: userId
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Meter reading has been recorded",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting meter reading:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record meter reading",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="property_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
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
          name="reading_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meter type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reading_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reading Value</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reading_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reading Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Reading"}
        </Button>
      </form>
    </Form>
  );
}