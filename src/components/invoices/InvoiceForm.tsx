import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceFormValues {
  amount: number;
  property_id: string;
  details?: string;
  document?: File;
  tenant_email?: string;
}

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const { toast } = useToast();
  const form = useForm<InvoiceFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [tenantEmail, setTenantEmail] = useState<string | null>(null);

  // Fetch properties when component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        return;
      }
      if (!user) return;

      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id, name")
        .eq("landlord_id", user.id);

      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
        return;
      }

      setProperties(properties || []);
    };

    fetchProperties();
  }, []);

  // Fetch tenant email when property is selected
  useEffect(() => {
    const fetchTenantEmail = async () => {
      if (!selectedPropertyId) return;

      const { data: tenancy, error: tenancyError } = await supabase
        .from("tenancies")
        .select(`
          tenant:profiles (
            email
          )
        `)
        .eq("property_id", selectedPropertyId)
        .eq("status", "active")
        .single();

      if (tenancyError) {
        console.error("Error fetching tenant:", tenancyError);
        return;
      }

      if (tenancy?.tenant?.email) {
        setTenantEmail(tenancy.tenant.email);
        form.setValue("tenant_email", tenancy.tenant.email);
      }
    };

    fetchTenantEmail();
  }, [selectedPropertyId, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      setIsLoading(true);
      console.log("Submitting invoice with values:", values);

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

      // Get the first tenant for this property
      const { data: tenancy, error: tenancyError } = await supabase
        .from("tenancies")
        .select("tenant_id")
        .eq("property_id", values.property_id)
        .eq("status", "active")
        .single();

      if (tenancyError) throw tenancyError;

      // Update tenant email if provided
      if (values.tenant_email) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ email: values.tenant_email })
          .eq("id", tenancy.tenant_id);

        if (updateError) throw updateError;
      }

      // Format the due date as an ISO string date
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          amount: values.amount,
          due_date: dueDate,
          landlord_id: user.id,
          property_id: values.property_id,
          tenant_id: tenancy.tenant_id,
          status: "pending",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items for the amount
      const { error: itemError } = await supabase
        .from("invoice_items")
        .insert({
          invoice_id: invoice.id,
          description: values.details || "Invoice payment",
          amount: values.amount,
          type: "rent"
        });

      if (itemError) throw itemError;

      // Upload document if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${invoice.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('invoice-documents')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;
      }

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      if (onSuccess) {
        onSuccess();
      }

      form.reset();
      setSelectedFile(null);
      setTenantEmail(null);
      setSelectedPropertyId(null);
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
        <Label htmlFor="property">Property</Label>
        <Select 
          onValueChange={(value) => {
            form.setValue("property_id", value);
            setSelectedPropertyId(value);
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPropertyId && (
        <div className="space-y-2">
          <Label htmlFor="tenant_email">Tenant Email</Label>
          <Input
            id="tenant_email"
            type="email"
            {...form.register("tenant_email")}
            defaultValue={tenantEmail || ""}
            placeholder="tenant@example.com"
          />
        </div>
      )}

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

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          {...form.register("details")}
          placeholder="Enter invoice details..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">Upload Document</Label>
        <Input
          id="document"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Invoice"}
      </Button>
    </form>
  );
}