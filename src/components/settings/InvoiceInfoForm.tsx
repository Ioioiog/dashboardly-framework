import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Json } from "@/integrations/supabase/types/json";

interface InvoiceInfoFormValues {
  company_name: string;
  company_address: string;
  bank_name: string;
  bank_account_number: string;
  bank_sort_code: string;
  additional_notes: string;
}

export function InvoiceInfoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<InvoiceInfoFormValues>();

  useEffect(() => {
    const fetchInvoiceInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('invoice_info')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.invoice_info) {
          // Type assertion to handle the conversion safely
          const invoiceInfo = data.invoice_info as Record<string, string>;
          form.reset({
            company_name: invoiceInfo.company_name || '',
            company_address: invoiceInfo.company_address || '',
            bank_name: invoiceInfo.bank_name || '',
            bank_account_number: invoiceInfo.bank_account_number || '',
            bank_sort_code: invoiceInfo.bank_sort_code || '',
            additional_notes: invoiceInfo.additional_notes || '',
          });
        }
      } catch (error) {
        console.error("Error fetching invoice info:", error);
      }
    };

    fetchInvoiceInfo();
  }, [form]);

  const onSubmit = async (data: InvoiceInfoFormValues) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Convert the form data to a plain object that matches the Json type
      const invoiceInfo: Record<string, string> = {
        company_name: data.company_name,
        company_address: data.company_address,
        bank_name: data.bank_name,
        bank_account_number: data.bank_account_number,
        bank_sort_code: data.bank_sort_code,
        additional_notes: data.additional_notes,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          invoice_info: invoiceInfo
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice information updated successfully",
      });
    } catch (error) {
      console.error("Error updating invoice info:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                {...form.register("company_name")}
                placeholder="Enter your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_address">Company Address</Label>
              <Textarea
                id="company_address"
                {...form.register("company_address")}
                placeholder="Enter your company address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                {...form.register("bank_name")}
                placeholder="Enter your bank name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  {...form.register("bank_account_number")}
                  placeholder="Enter account number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_sort_code">Sort Code</Label>
                <Input
                  id="bank_sort_code"
                  {...form.register("bank_sort_code")}
                  placeholder="Enter sort code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                {...form.register("additional_notes")}
                placeholder="Enter any additional information to appear on invoices"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Invoice Information"}
          </Button>
        </form>

        <div className="grid gap-6 pt-4">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-medium">Invoice Generation</h3>
              <p className="text-sm text-muted-foreground">
                Invoices are automatically generated on the 1st of each month
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Receipt className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-medium">Payment Processing</h3>
              <p className="text-sm text-muted-foreground">
                Payments are processed through Stripe and typically settle within 2-3 business days
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-purple-500" />
            <div>
              <h3 className="font-medium">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">
                You can accept payments via credit card, debit card, and bank transfer
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}