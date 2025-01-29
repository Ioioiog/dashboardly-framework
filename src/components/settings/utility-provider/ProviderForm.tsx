import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertySelect } from "@/components/documents/PropertySelect";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
  property_id?: string;
  utility_type?: 'electricity' | 'water' | 'gas';
  start_day?: number;
  end_day?: number;
}

interface ProviderFormProps {
  onClose: () => void;
  onSuccess: () => void;
  provider?: UtilityProvider | null;
}

export function ProviderForm({ onClose, onSuccess, provider }: ProviderFormProps) {
  const { properties } = useProperties({ userRole: "landlord" });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider_name: provider?.provider_name || "",
    username: provider?.username || "",
    password: "",
    property_id: provider?.property_id || "",
    utility_type: provider?.utility_type || "electricity",
    start_day: provider?.start_day || 1,
    end_day: provider?.end_day || 28
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const operation = provider ? 
        supabase
          .from("utility_provider_credentials")
          .update({
            provider_name: formData.provider_name,
            username: formData.username,
            encrypted_password: formData.password,
            property_id: formData.property_id || null,
            utility_type: formData.utility_type,
            start_day: formData.start_day,
            end_day: formData.end_day
          })
          .eq('id', provider.id) :
        supabase
          .from("utility_provider_credentials")
          .insert({
            provider_name: formData.provider_name,
            username: formData.username,
            encrypted_password: formData.password,
            property_id: formData.property_id || null,
            landlord_id: user.id,
            utility_type: formData.utility_type,
            start_day: formData.start_day,
            end_day: formData.end_day
          });

      const { error } = await operation;

      if (error) throw error;

      toast({
        title: "Success",
        description: `Provider ${provider ? 'updated' : 'added'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving provider:", error);
      toast({
        title: "Error",
        description: `Failed to ${provider ? 'update' : 'add'} provider`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provider_name">Provider Name</Label>
        <Input
          id="provider_name"
          value={formData.provider_name}
          onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
          placeholder="Enter provider name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Enter username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter password"
          required={!provider}
        />
      </div>
      <div className="space-y-2">
        <PropertySelect
          properties={properties}
          selectedPropertyId={formData.property_id}
          onPropertyChange={(value) => setFormData({ ...formData, property_id: value })}
        />
      </div>
      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Saving..." : (provider ? "Update" : "Add Provider")}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}