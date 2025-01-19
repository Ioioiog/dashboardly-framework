import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface InvoiceFormValues {
  amount: number;
}

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<InvoiceFormValues>();

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      // Check if user is a landlord
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.role !== "landlord") throw new Error("Only landlords can create invoices");

      // Get the first property owned by the landlord
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .select("id")
        .eq("landlord_id", user.id)
        .single();

      if (propertyError) throw propertyError;

      // Get the first tenant for this property
      const { data: tenancy, error: tenancyError } = await supabase
        .from("tenancies")
        .select("tenant_id")
        .eq("property_id", property.id)
        .eq("status", "active")
        .single();

      if (tenancyError) throw tenancyError;

      // Format the due date as an ISO string date
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Create the invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          amount: values.amount,
          due_date: dueDate,
          landlord_id: user.id,
          property_id: property.id,
          tenant_id: tenancy.tenant_id,
          status: "pending",
        });

      if (invoiceError) throw invoiceError;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      if (onSuccess) {
        onSuccess();
      }

      form.reset();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...form.register("amount", { 
            required: true,
            valueAsNumber: true,
            min: 0
          })}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Invoice"}
      </Button>
    </form>
  );
}