import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
}

export function UtilityProviderForm() {
  const [providers, setProviders] = useState<UtilityProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProvider, setNewProvider] = useState({
    provider_name: "",
    username: "",
    password: "",
  });
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("utility_provider_credentials")
        .select("id, provider_name, username");

      if (error) throw error;
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

  useState(() => {
    fetchProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("utility_provider_credentials")
        .insert({
          provider_name: newProvider.provider_name,
          username: newProvider.username,
          encrypted_password: newProvider.password, // Note: In production, implement proper encryption
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utility Provider Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* List existing providers */}
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{provider.provider_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Username: {provider.username}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(provider.id)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* Add new provider form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider_name">Provider Name</Label>
              <Input
                id="provider_name"
                value={newProvider.provider_name}
                onChange={(e) =>
                  setNewProvider((prev) => ({
                    ...prev,
                    provider_name: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
                placeholder="e.g., Electric Company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newProvider.username}
                onChange={(e) =>
                  setNewProvider((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newProvider.password}
                onChange={(e) =>
                  setNewProvider((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Adding Provider..." : "Add Provider"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}