import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProviderList } from "./utility-provider/ProviderList";
import { ProviderForm } from "./utility-provider/ProviderForm";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
}

export function UtilityProviderForm() {
  const [providers, setProviders] = useState<UtilityProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProvider, setNewProvider] = useState({
    provider_name: "",
    username: "",
    password: "",
  });
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      console.log('Fetching utility providers');
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("utility_provider_credentials")
        .select("id, provider_name, username");

      if (error) throw error;
      console.log('Fetched providers:', data);
      setProviders(data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast({
        title: "Error",
        description: "Failed to load utility providers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Adding new utility provider');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const { error } = await supabase
        .from("utility_provider_credentials")
        .insert({
          provider_name: newProvider.provider_name,
          username: newProvider.username,
          encrypted_password: newProvider.password, // Note: In production, implement proper encryption
          landlord_id: userData.user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Utility provider credentials added successfully",
      });

      setNewProvider({
        provider_name: "",
        username: "",
        password: "",
      });

      fetchProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
      toast({
        title: "Error",
        description: "Failed to add utility provider",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting utility provider:', id);
      setIsLoading(true);
      const { error } = await supabase
        .from("utility_provider_credentials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Utility provider removed successfully",
      });

      fetchProviders();
    } catch (error) {
      console.error("Error removing provider:", error);
      toast({
        title: "Error",
        description: "Failed to remove utility provider",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utility Provider Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProviderList 
          providers={providers}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
        <ProviderForm
          data={newProvider}
          onChange={setNewProvider}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}