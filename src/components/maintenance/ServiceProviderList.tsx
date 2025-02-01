import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Globe, Star, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";

interface ServiceProviderProfile {
  first_name: string | null;
  last_name: string | null;
}

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
  profile: ServiceProviderProfile;
  services?: ServiceProviderService[];
  isPreferred?: boolean;
}

interface SupabaseServiceProvider {
  id: string;
  business_name: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  service_area: string[] | null;
  rating: number | null;
  review_count: number | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
  };
  services: ServiceProviderService[];
}

export function ServiceProviderList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUserId } = useAuthState();

  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers-details"],
    queryFn: async () => {
      console.log("Fetching service providers with details");
      
      if (!currentUserId) {
        console.log("No user ID available");
        return [];
      }

      // First get the landlord's preferred providers
      const { data: preferredProviders, error: preferredError } = await supabase
        .from("landlord_service_providers")
        .select("service_provider_id")
        .eq('landlord_id', currentUserId);

      if (preferredError) {
        console.error("Error fetching preferred providers:", preferredError);
        throw preferredError;
      }

      // Then get all service providers with their profile and service information
      const { data: providers, error: providersError } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          service_provider_profiles!service_provider_profiles_id_fkey (
            business_name,
            description,
            contact_phone,
            contact_email,
            website,
            service_area,
            rating,
            review_count,
            services:service_provider_services (
              name,
              category,
              base_price,
              price_unit
            )
          )
        `)
        .eq('role', 'service_provider');

      if (providersError) {
        console.error("Error fetching providers:", providersError);
        throw providersError;
      }

      // Create a set of preferred provider IDs for quick lookup
      const preferredIds = new Set(preferredProviders?.map(p => p.service_provider_id) || []);

      // Format and sort the providers data
      const formattedProviders: ServiceProvider[] = (providers || []).map(provider => ({
        id: provider.id,
        ...provider.service_provider_profiles,
        profile: {
          first_name: provider.first_name,
          last_name: provider.last_name
        },
        isPreferred: preferredIds.has(provider.id)
      })).sort((a, b) => {
        if (a.isPreferred === b.isPreferred) {
          const aName = a.business_name || `${a.profile.first_name} ${a.profile.last_name}`;
          const bName = b.business_name || `${b.profile.first_name} ${b.profile.last_name}`;
          return aName.localeCompare(bName);
        }
        return a.isPreferred ? -1 : 1;
      });

      return formattedProviders;
    },
    enabled: !!currentUserId
  });

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
        description: `${provider.profile.first_name} ${provider.profile.last_name} has been ${provider.isPreferred ? 'removed from' : 'added to'} your preferred providers list.`,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {serviceProviders.map((provider) => (
        <Card 
          key={provider.id} 
          className={cn(
            "p-6 space-y-4",
            provider.isPreferred && "border-2 border-primary"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {provider.business_name || `${provider.profile.first_name} ${provider.profile.last_name}`}
                </h3>
                {provider.isPreferred && (
                  <Badge variant="secondary" className="ml-2">
                    Preferred
                  </Badge>
                )}
              </div>
              {provider.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {provider.description}
                </p>
              )}
            </div>
            {provider.rating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" /> {provider.rating.toFixed(1)}
                {provider.review_count > 0 && (
                  <span className="text-xs">({provider.review_count})</span>
                )}
              </Badge>
            )}
          </div>

          {provider.services && provider.services.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Services Offered:</h4>
              <div className="flex flex-wrap gap-2">
                {provider.services.map((service, index) => (
                  <Badge key={index} variant="outline">
                    {service.name}
                    {service.base_price && ` - ${service.base_price} ${service.price_unit || ''}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {provider.contact_phone && (
              <a
                href={`tel:${provider.contact_phone}`}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Phone className="h-4 w-4" />
                {provider.contact_phone}
              </a>
            )}
            {provider.contact_email && (
              <a
                href={`mailto:${provider.contact_email}`}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Mail className="h-4 w-4" />
                {provider.contact_email}
              </a>
            )}
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handlePreferredToggle(provider)}
            >
              {provider.isPreferred ? 'Remove from Preferred' : 'Add to Preferred'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}