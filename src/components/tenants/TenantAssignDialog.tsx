import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registerTenant } from "@/utils/tenantUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface TenantAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
  propertyName?: string;
}

export function TenantAssignDialog({
  open,
  onOpenChange,
  propertyId,
  propertyName,
}: TenantAssignDialogProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingTenants, setExistingTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isNewTenant, setIsNewTenant] = useState(true);
  const [availableProperties, setAvailableProperties] = useState<any[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>(propertyId ? [propertyId] : []);
  const { toast } = useToast();

  // Fetch existing tenants and available properties when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchExistingTenants();
      fetchAvailableProperties();
    }
  }, [open]);

  const fetchExistingTenants = async () => {
    try {
      const { data: tenants, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('role', 'tenant');

      if (error) throw error;
      setExistingTenants(tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing tenants",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableProperties = async () => {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .not('tenancies', 'cs', '[{"status":"active"}]');

      if (error) throw error;
      setAvailableProperties(properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available properties",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedPropertyIds.length === 0) {
        throw new Error("Please select at least one property");
      }

      if (isNewTenant) {
        // Register new tenant for multiple properties
        await registerTenant({
          email,
          firstName,
          lastName,
          propertyIds: selectedPropertyIds,
          startDate,
          endDate
        });

        toast({
          title: "Success",
          description: "Tenant invitation sent and tenancies created successfully",
        });
      } else if (selectedTenantId) {
        // Create tenancies for existing tenant
        const tenancies = selectedPropertyIds.map(propertyId => ({
          property_id: propertyId,
          tenant_id: selectedTenantId,
          start_date: startDate,
          end_date: endDate || null,
          status: 'active'
        }));

        const { error: tenancyError } = await supabase
          .from('tenancies')
          .insert(tenancies);

        if (tenancyError) throw tenancyError;

        toast({
          title: "Success",
          description: "Tenancies created successfully",
        });
      }

      onOpenChange(false);
      // Reset form
      setEmail("");
      setFirstName("");
      setLastName("");
      setStartDate("");
      setEndDate("");
      setSelectedTenantId(null);
      setSelectedPropertyIds([]);
    } catch (error: any) {
      console.error("Error in tenant assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign tenant",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Tenant to Properties</DialogTitle>
          <DialogDescription>
            {propertyName ? `Assign a tenant to: ${propertyName}` : 'Assign a tenant to multiple properties'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4">
          <Label>Tenant Type</Label>
          <div className="flex gap-4 mt-2">
            <Button
              variant={isNewTenant ? "default" : "outline"}
              onClick={() => setIsNewTenant(true)}
            >
              New Tenant
            </Button>
            <Button
              variant={!isNewTenant ? "default" : "outline"}
              onClick={() => setIsNewTenant(false)}
            >
              Existing Tenant
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isNewTenant ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tenant@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>Select Existing Tenant</Label>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {existingTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      checked={selectedTenantId === tenant.id}
                      onCheckedChange={() => setSelectedTenantId(tenant.id)}
                    />
                    <Label>
                      {tenant.first_name} {tenant.last_name} ({tenant.email})
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Properties</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {availableProperties.map((property) => (
                <div key={property.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    checked={selectedPropertyIds.includes(property.id)}
                    onCheckedChange={(checked) => {
                      setSelectedPropertyIds(prev => 
                        checked 
                          ? [...prev, property.id]
                          : prev.filter(id => id !== property.id)
                      );
                    }}
                    disabled={propertyId === property.id}
                  />
                  <Label>
                    {property.name} ({property.address})
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Tenancy..." : "Create Tenancy"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}