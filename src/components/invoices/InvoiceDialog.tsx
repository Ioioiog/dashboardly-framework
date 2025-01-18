import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProperties } from "@/hooks/useProperties";
import { Plus } from "lucide-react";

interface InvoiceDialogProps {
  onInvoiceCreated: () => void;
}

export function InvoiceDialog({ onInvoiceCreated }: InvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [propertyId, setPropertyId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { properties, isLoading } = useProperties({ userRole: "landlord" });

  const handleSubmit = async () => {
    if (!propertyId || !dueDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all required fields.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Get property details
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .select("monthly_rent")
        .eq("id", propertyId)
        .single();

      if (propertyError) throw propertyError;

      // Get tenant details
      const { data: tenancy, error: tenancyError } = await supabase
        .from("tenancies")
        .select("tenant_id")
        .eq("property_id", propertyId)
        .eq("status", "active")
        .single();

      if (tenancyError) throw tenancyError;

      // Get utilities for the property
      const { data: utilities, error: utilitiesError } = await supabase
        .from("utilities")
        .select("amount")
        .eq("property_id", propertyId)
        .eq("status", "pending");

      if (utilitiesError) throw utilitiesError;

      // Calculate total amount
      const utilitiesTotal = utilities?.reduce((sum, utility) => sum + utility.amount, 0) || 0;
      const totalAmount = property.monthly_rent + utilitiesTotal;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          property_id: propertyId,
          tenant_id: tenancy.tenant_id,
          landlord_id: user.id,
          amount: totalAmount,
          due_date: dueDate,
          status: "pending",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const invoiceItems = [
        {
          invoice_id: invoice.id,
          description: "Monthly Rent",
          amount: property.monthly_rent,
          type: "rent",
        },
        ...(utilities || []).map((utility: any) => ({
          invoice_id: invoice.id,
          description: `Utility Bill`,
          amount: utility.amount,
          type: "utility",
        })),
      ];

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Invoice generated successfully!",
      });
      setOpen(false);
      onInvoiceCreated();
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate invoice.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="property">Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Generating..." : "Generate Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}