import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ServiceProvider {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface LandlordFieldsProps {
  serviceProviders: ServiceProvider[] | null;
  formData: {
    assigned_to: string | null;
    service_provider_notes: string | null;
    notes: string | null;
  };
  onChange: (field: string, value: string | null) => void;
}

export function LandlordFields({ serviceProviders, formData, onChange }: LandlordFieldsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProvider, setNewProvider] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();

  const handleCreateServiceProvider = async () => {
    try {
      setIsCreating(true);
      console.log("Creating new service provider:", newProvider);

      // Create auth user with service provider role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newProvider.email,
        password: "tempPass123!", // You might want to generate this randomly
        options: {
          data: {
            role: "service_provider",
          },
        },
      });

      if (authError) throw authError;

      // Profile is created automatically via trigger, but we need to update the details
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: newProvider.first_name,
          last_name: newProvider.last_name,
          phone: newProvider.phone,
          role: "service_provider",
        })
        .eq("id", authData.user!.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Service provider created successfully. They will receive an email to set their password.",
      });

      setIsCreateDialogOpen(false);
      setNewProvider({ first_name: "", last_name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error creating service provider:", error);
      toast({
        title: "Error",
        description: "Failed to create service provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Assign Service Provider</Label>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Create New Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Service Provider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newProvider.first_name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newProvider.last_name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newProvider.email}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newProvider.phone}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateServiceProvider}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Service Provider"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select
        value={formData.assigned_to || ""}
        onValueChange={(value) => onChange("assigned_to", value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a service provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {serviceProviders?.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.first_name} {provider.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2">
        <Label htmlFor="service_provider_notes">Instructions for Service Provider</Label>
        <Textarea
          id="service_provider_notes"
          value={formData.service_provider_notes || ""}
          onChange={(e) => onChange("service_provider_notes", e.target.value)}
          placeholder="Add any specific instructions for the service provider..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal_notes">Internal Notes</Label>
        <Textarea
          id="internal_notes"
          value={formData.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Add any internal notes..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}