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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvoiceFormProps {
  onSuccess?: () => Promise<void>;
}

interface InvoiceFormValues {
  amount: number;
  description: string;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Get the user's profile to check if they're a landlord
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.role !== "landlord") throw new Error("Only landlords can create invoices");

      // Create the invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          amount: values.amount,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          landlord_id: user.id,
          status: "pending",
        });

      if (invoiceError) throw invoiceError;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice. Please try again.",
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="Enter amount" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
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
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Invoice"}
        </Button>
      </form>
    </Form>
  );
}