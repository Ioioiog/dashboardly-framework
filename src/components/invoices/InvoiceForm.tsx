import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InvoiceFormProps {
  onSuccess?: () => void;
}

interface Property {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UtilityBill {
  id: string;
  type: string;
  amount: number;
  due_date: string;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [selectedUtilityIds, setSelectedUtilityIds] = useState<string[]>([]);
  const [details, setDetails] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchTenants(selectedPropertyId);
      fetchUtilityBills(selectedPropertyId);
    } else {
      setTenants([]);
      setUtilityBills([]);
      setSelectedUtilityIds([]);
    }
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    try {
      console.log("Fetching properties...");
      const { data: propertiesData, error } = await supabase
        .from("properties")
        .select("id, name");

      if (error) throw error;
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch properties",
      });
    }
  };

  const fetchTenants = async (propertyId: string) => {
    try {
      console.log("Fetching tenants for property:", propertyId);
      const { data: tenanciesData, error } = await supabase
        .from("tenancies")
        .select(`
          tenant:profiles!tenancies_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("property_id", propertyId)
        .eq("status", "active");

      if (error) throw error;

      const tenantsData = tenanciesData
        .map((t) => t.tenant)
        .filter((t): t is Tenant => t !== null);
      setTenants(tenantsData);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tenants",
      });
    }
  };

  const fetchUtilityBills = async (propertyId: string) => {
    try {
      console.log("Fetching utility bills for property:", propertyId);
      
      // First, get the IDs of utilities that are already invoiced
      const { data: invoicedUtilities, error: invoiceError } = await supabase
        .from("invoice_items")
        .select("description")
        .eq("type", "utility");

      if (invoiceError) throw invoiceError;

      // Extract utility IDs from descriptions (if any exist)
      const invoicedUtilityIds = (invoicedUtilities || [])
        .map(item => {
          const match = item.description.match(/Utility Bill - ID: (.+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      console.log("Invoiced utility IDs:", invoicedUtilityIds);

      // Build the query for pending utilities
      let query = supabase
        .from("utilities")
        .select("*")
        .eq("property_id", propertyId)
        .eq("status", "pending");

      // Only add the not-in filter if we have invoiced utilities
      if (invoicedUtilityIds.length > 0) {
        query = query.not('id', 'in', `(${invoicedUtilityIds.join(',')})`);
      }

      const { data: utilityData, error: utilityError } = await query;

      if (utilityError) throw utilityError;
      console.log("Fetched utility bills:", utilityData);
      setUtilityBills(utilityData || []);
    } catch (error) {
      console.error("Error fetching utility bills:", error);
      setUtilityBills([]); // Ensure utilityBills is always an array
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch utility bills",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPropertyId || !selectedTenantId || selectedUtilityIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Creating manual invoice...");

      const selectedUtilities = utilityBills.filter(u => selectedUtilityIds.includes(u.id));
      if (selectedUtilities.length === 0) {
        throw new Error("No utility bills selected");
      }

      const totalAmount = selectedUtilities.reduce((sum, utility) => sum + utility.amount, 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          property_id: selectedPropertyId,
          tenant_id: selectedTenantId,
          landlord_id: user.id,
          amount: totalAmount,
          due_date: selectedUtilities[0].due_date,
          status: "pending"
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items for each selected utility bill
      const invoiceItems = selectedUtilities.map(utility => ({
        invoice_id: invoice.id,
        description: `Utility Bill - ID: ${utility.id}`,
        amount: utility.amount,
        type: "utility"
      }));

      const { error: itemError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemError) throw itemError;

      // Update utility statuses
      const { error: utilityError } = await supabase
        .from("utilities")
        .update({ status: "invoiced" })
        .in("id", selectedUtilityIds);

      if (utilityError) throw utilityError;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create invoice",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertDescription>
          VAT is not applied to manual invoices.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="property">Property</Label>
          <Select
            value={selectedPropertyId}
            onValueChange={(value) => {
              setSelectedPropertyId(value);
              setSelectedTenantId("");
              setSelectedUtilityIds([]);
            }}
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
          <div>
            <Label htmlFor="tenant">Tenant</Label>
            <Select
              value={selectedTenantId}
              onValueChange={setSelectedTenantId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {`${tenant.first_name} ${tenant.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedPropertyId && (
          <div>
            <Label>Assign Utility Bills</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedUtilityIds.length === 0
                    ? "Select utility bills..."
                    : `${selectedUtilityIds.length} bill${selectedUtilityIds.length === 1 ? '' : 's'} selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search utility bills..." />
                  <CommandEmpty>No utility bills found.</CommandEmpty>
                  <CommandGroup>
                    {utilityBills.map((bill) => (
                      <CommandItem
                        key={bill.id}
                        onSelect={() => {
                          setSelectedUtilityIds((prev) => {
                            const isSelected = prev.includes(bill.id);
                            if (isSelected) {
                              return prev.filter((id) => id !== bill.id);
                            } else {
                              return [...prev, bill.id];
                            }
                          });
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedUtilityIds.includes(bill.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {`${bill.type} - $${bill.amount} (Due: ${new Date(bill.due_date).toLocaleDateString()})`}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div>
          <Label htmlFor="details">Additional Details (Optional)</Label>
          <Textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="h-32"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || selectedUtilityIds.length === 0}>
        {isLoading ? "Creating..." : "Create Invoice"}
      </Button>
    </form>
  );
}