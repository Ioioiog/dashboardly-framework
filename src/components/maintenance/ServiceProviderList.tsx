import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { ServiceProviderCard } from "./service-provider/ServiceProviderCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ServiceProviderService {
  name: string;
  base_price?: number;
  price_unit?: string;
  category: string;
}

interface ServiceProvider {
  id: string;
  business_name?: string | null;
  description?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
  service_area?: string[];
  rating?: number;
  review_count?: number;
  profiles: Array<{
    first_name: string | null;
    last_name: string | null;
  }>;
  services?: ServiceProviderService[];
  isPreferred?: boolean;
}

export function ServiceProviderList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUserId } = useAuthState();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProvider, setNewProvider] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const { data: serviceProviders, isLoading } = useQuery({
    queryKey: ["service-providers-details"],
    queryFn: async () => {
      console.log("Fetching service providers with details");
      
      if (!currentUserId) {
        console.log("No user ID available");
        return [];
      }

      const { data: preferredProviders, error: preferredError } = await supabase
        .from("landlord_service_providers")
        .select("service_provider_id")
        .eq('landlord_id', currentUserId);

      if (preferredError) {
        console.error("Error fetching preferred providers:", preferredError);
        throw preferredError;
      }

      const { data: providers, error: providersError } = await supabase
        .from("service_provider_profiles")
        .select(`
          id,
          business_name,
          description,
          contact_phone,
          contact_email,
          website,
          service_area,
          rating,
          review_count,
          profiles!fk_profiles (
            first_name,
            last_name
          ),
          services:service_provider_services (
            name,
            category,
            base_price,
            price_unit
          )
        `);

      if (providersError) {
        console.error("Error fetching providers:", providersError);
        throw providersError;
      }

      const preferredIds = new Set(preferredProviders?.map(p => p.service_provider_id) || []);

      return (providers || [])
        .map(provider => ({
          ...provider,
          profiles: Array.isArray(provider.profiles) ? provider.profiles : [provider.profiles],
          isPreferred: preferredIds.has(provider.id)
        }))
        .sort((a, b) => {
          if (a.isPreferred === b.isPreferred) {
            const aName = a.business_name || `${a.profiles[0]?.first_name} ${a.profiles[0]?.last_name}`;
            const bName = b.business_name || `${b.profiles[0]?.first_name} ${b.profiles[0]?.last_name}`;
            return aName.localeCompare(bName);
          }
          return a.isPreferred ? -1 : 1;
        });
    },
    enabled: !!currentUserId
  });

  const handleCreateServiceProvider = async () => {
    try {
      setIsCreating(true);
      console.log("Creating new service provider:", newProvider);

      const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', newProvider.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (existingProfiles) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: newProvider.first_name,
            last_name: newProvider.last_name,
            phone: newProvider.phone,
            role: 'service_provider',
          })
          .eq('id', existingProfiles.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Existing user updated as service provider successfully.",
        });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newProvider.email,
          password: "tempPass123!",
          options: {
            data: {
              role: "service_provider",
            },
          },
        });

        if (authError) throw authError;

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
      }

      setIsCreateDialogOpen(false);
      setNewProvider({ first_name: "", last_name: "", email: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ['service-providers-details'] });
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

  const handlePreferredToggle = async (provider: ServiceProvider) => {
    if (!currentUserId) {
      console.error("No user ID available");
      return;
    }

    try {
      if (provider.isPreferred) {
        await supabase
          .from('landlord_service_providers')
          .delete()
          .eq('landlord_id', currentUserId)
          .eq('service_provider_id', provider.id);
      } else {
        await supabase
          .from('landlord_service_providers')
          .insert({
            landlord_id: currentUserId,
            service_provider_id: provider.id
          });
      }
      
      queryClient.invalidateQueries({ queryKey: ['service-providers-details'] });
      
      toast({
        title: provider.isPreferred ? "Removed from preferred providers" : "Added to preferred providers",
        description: `${provider.business_name || `${provider.profiles[0]?.first_name} ${provider.profiles[0]?.last_name}`} has been ${provider.isPreferred ? 'removed from' : 'added to'} your preferred providers list.`,
      });
    } catch (error) {
      console.error('Error updating preferred status:', error);
      toast({
        title: "Error",
        description: "Failed to update preferred status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!serviceProviders?.length) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-2">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">No Service Providers Found</h3>
          <p className="text-sm text-muted-foreground">
            There are currently no service providers available in the system.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Create New Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newProvider.last_name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full"
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
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newProvider.phone}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full"
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleCreateServiceProvider}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Service Provider"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !serviceProviders?.length ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">No Service Providers Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                There are currently no service providers available. Click the button above to add your first service provider.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceProviders?.map((provider) => (
            <ServiceProviderCard
              key={provider.id}
              provider={provider}
              onPreferredToggle={handlePreferredToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}