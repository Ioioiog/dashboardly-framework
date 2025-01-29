import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProviderList } from "./utility-provider/ProviderList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/use-user-role";
import { useProperties } from "@/hooks/useProperties";
import { Label } from "@/components/ui/label";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
  property_id?: string;
  utility_type?: 'electricity' | 'water' | 'gas';
  start_day?: number;
  end_day?: number;
}

export function UtilityProviderForm() {
  const [providers, setProviders] = useState<UtilityProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProvider, setNewProvider] = useState({
    provider_name: "",
    username: "",
    password: "",
    property_id: "",
    utility_type: "electricity" as 'electricity' | 'water' | 'gas',
    start_day: "",
    end_day: "",
  });

  const { toast } = useToast();
  const { userRole } = useUserRole();
  const { properties } = useProperties({ userRole: userRole || 'tenant' });

  const fetchProviders = async () => {
    try {
      console.log('Fetching utility providers');
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("utility_provider_credentials")
        .select("id, provider_name, username, property_id, utility_type, start_day, end_day");

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

    const startDayNum = parseInt(newProvider.start_day);
    const endDayNum = parseInt(newProvider.end_day);

    if (startDayNum < 1 || startDayNum > 31 || endDayNum < 1 || endDayNum > 31) {
      toast({
        title: "Error",
        description: "Days must be between 1 and 31",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Adding new utility provider');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const { error } = await supabase
        .from("utility_provider_credentials")
        .insert({
          provider_name: newProvider.provider_name,
          username: newProvider.username,
          encrypted_password: newProvider.password,
          property_id: newProvider.property_id || null,
          utility_type: newProvider.utility_type,
          start_day: startDayNum,
          end_day: endDayNum,
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
        property_id: "",
        utility_type: "electricity",
        start_day: "",
        end_day: "",
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

      const { error: scrapingJobsError } = await supabase
        .from("scraping_jobs")
        .delete()
        .eq("utility_provider_id", id);

      if (scrapingJobsError) {
        console.error("Error deleting scraping jobs:", scrapingJobsError);
        throw scrapingJobsError;
      }

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

  if (userRole !== 'landlord') {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Utility Provider Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <ProviderList 
              providers={providers}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input
                    value={newProvider.provider_name}
                    onChange={(e) => setNewProvider({ ...newProvider, provider_name: e.target.value })}
                    placeholder="Enter provider name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={newProvider.username}
                    onChange={(e) => setNewProvider({ ...newProvider, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newProvider.password}
                    onChange={(e) => setNewProvider({ ...newProvider, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select
                    value={newProvider.property_id}
                    onValueChange={(value) => setNewProvider({ ...newProvider, property_id: value })}
                  >
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

                <div className="space-y-2">
                  <Label>Utility Type</Label>
                  <Select
                    value={newProvider.utility_type}
                    onValueChange={(value: 'electricity' | 'water' | 'gas') => 
                      setNewProvider({ ...newProvider, utility_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select utility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Day</Label>
                  <Input
                    type="number"
                    placeholder="Start Day (1-31)"
                    min="1"
                    max="31"
                    value={newProvider.start_day}
                    onChange={(e) => setNewProvider({ ...newProvider, start_day: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Day</Label>
                  <Input
                    type="number"
                    placeholder="End Day (1-31)"
                    min="1"
                    max="31"
                    value={newProvider.end_day}
                    onChange={(e) => setNewProvider({ ...newProvider, end_day: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Provider"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}