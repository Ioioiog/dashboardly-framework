import { Card, CardContent } from "@/components/ui/card";
import { Invoice } from "@/types/invoice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { useState } from "react";
import { InvoiceDetails } from "./InvoiceDetails";
import { InvoiceActions } from "./InvoiceActions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvoiceListProps {
  invoices: Invoice[];
  userRole: "landlord" | "tenant";
  onStatusUpdate?: () => void;
}

export function InvoiceList({ invoices, userRole, onStatusUpdate }: InvoiceListProps) {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      console.log("Fetching invoice details for ID:", invoice.id);
      
      // Get invoice items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      if (itemsError) throw itemsError;

      // Get landlord profile for company info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('invoice_info')
        .eq('id', invoice.landlord_id)
        .single();

      if (profileError) throw profileError;

      // Transform invoice items
      const transformedItems = items.map(item => ({
        description: item.description,
        unitPrice: item.amount,
        quantity: 1,
        type: item.type
      }));

      setInvoiceItems(transformedItems);
      setCompanyInfo(profile.invoice_info);
      setSelectedInvoice(invoice);

    } catch (error) {
      console.error("Error viewing invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to retrieve invoice details.",
      });
    }
  };

  return (
    <>
      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-6">
              <InvoiceDetails invoice={invoice} userRole={userRole} />
              <div className="mt-4 flex items-center justify-between">
                <InvoiceActions
                  invoiceId={invoice.id}
                  status={invoice.status}
                  userRole={userRole}
                  onStatusUpdate={onStatusUpdate}
                  onViewInvoice={() => handleViewInvoice(invoice)}
                  isSendingEmail={isSendingEmail}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No invoices found.
          </div>
        )}
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          {selectedInvoice && companyInfo && (
            <InvoiceGenerator
              invoice={selectedInvoice}
              invoiceItems={invoiceItems}
              companyInfo={companyInfo}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}