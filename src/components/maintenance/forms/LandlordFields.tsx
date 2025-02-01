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

export interface LandlordFieldsProps {
  serviceProviders: ServiceProvider[];
  formData: {
    assigned_to: string | null;
    service_provider_notes: string | null;
    notes: string | null;
  };
  onChange: (field: string, value: string | null) => void;
  userRole?: string;
}

export function LandlordFields({ serviceProviders, formData, onChange, userRole = "tenant" }: LandlordFieldsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProvider, setNewProvider] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();
  const isLandlord = userRole === "landlord";

  const handleCreateServiceProvider = async () => {
    try {
      setIsCreating(true);
      console.log("Creating new service provider:", newProvider);

      // First check if the user already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', newProvider.email)
        .maybeSingle();

      if (profileError) {
        console.error("Error checking existing profile:", profileError);
        throw profileError;
      }

      console.log("Existing profile check result:", existingProfile);

      if (existingProfile) {
        // Update existing profile to service provider role if they exist
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: newProvider.first_name,
            last_name: newProvider.last_name,
            phone: newProvider.phone,
            role: 'service_provider',
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error("Error updating existing profile:", updateError);
          throw updateError;
        }

        toast({
          title: "Success",
          description: "Existing user updated as service provider successfully.",
        });
      } else {
        console.log("Creating new auth user for service provider");
        // Create new auth user with service provider role
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newProvider.email,
          password: "tempPass123!", // You might want to generate this randomly
          options: {
            data: {
              role: "service_provider",
            },
          },
        });

        if (authError) {
          console.error("Error creating auth user:", authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error("No user data returned from auth signup");
        }

        console.log("Auth user created successfully:", authData.user.id);

        // Profile is created automatically via trigger, but we need to update the details
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: newProvider.first_name,
            last_name: newProvider.last_name,
            phone: newProvider.phone,
            role: "service_provider",
          })
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("Error updating new profile:", updateError);
          throw updateError;
        }

        toast({
          title: "Success",
          description: "Service provider created successfully. They will receive an email to set their password.",
        });
      }

      setIsCreateDialogOpen(false);
      setNewProvider({ first_name: "", last_name: "", email: "", phone: "" });
    } catch (error: any) {
      console.error("Error creating service provider:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getServiceProviderName = (id: string | null) => {
    if (!id) return "Not assigned";
    const provider = serviceProviders.find(p => p.id === id);
    return provider ? `${provider.first_name} ${provider.last_name}` : "Not assigned";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Service Provider</Label>
        {isLandlord && (
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
        )}
      </div>

      {isLandlord ? (
        <Select
          value={formData.assigned_to || undefined}
          onValueChange={(value) => onChange("assigned_to", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service provider" />
          </SelectTrigger>
          <SelectContent>
            {serviceProviders?.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.first_name} {provider.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="p-3 bg-gray-50 rounded-md border">
          {getServiceProviderName(formData.assigned_to)}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="service_provider_notes">Instructions for Service Provider</Label>
        {isLandlord ? (
          <Textarea
            id="service_provider_notes"
            value={formData.service_provider_notes || ""}
            onChange={(e) => onChange("service_provider_notes", e.target.value)}
            placeholder="Add any specific instructions for the service provider..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
            {formData.service_provider_notes || "No instructions provided"}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal_notes">Internal Notes</Label>
        {isLandlord ? (
          <Textarea
            id="internal_notes"
            value={formData.notes || ""}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Add any internal notes..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
            {formData.notes || "No internal notes"}
          </div>
        )}
      </div>
    </div>
  );
}