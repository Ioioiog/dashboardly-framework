import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Users, List, Phone, Mail, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceDialog from "@/components/maintenance/MaintenanceDialog";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";
import { Card } from "@/components/ui/card";
import { NoDataCard } from "@/components/dashboard/charts/NoDataCard";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/hooks/useAuthState";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Filters {
  status: MaintenanceStatus | "all";
  priority: string;
  propertyId: string;
}

type MaintenanceSection = "requests" | "providers";

interface ServiceProviderProfile {
  first_name: string;
  last_name: string;
}

interface ServiceProviderService {
  name: string;
  base_price?: number;
  price_unit?: string;
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
  profiles: ServiceProviderProfile;
  services?: ServiceProviderService[];
  isPreferred?: boolean;
}

export default function Maintenance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>();
  const [activeSection, setActiveSection] = React.useState<MaintenanceSection>("requests");
  const [filters, setFilters] = React.useState<Filters>({
    status: "all",
    priority: "all",
    propertyId: "all",
  });

  useEffect(() => {
    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: maintenanceRequests, isLoading } = useQuery({
    queryKey: ["maintenance-requests", filters],
    queryFn: async () => {
      console.log("Fetching maintenance requests with filters:", filters);
      console.log("Current user role:", userRole);
      
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(name),
          tenant:profiles!maintenance_requests_tenant_id_fkey(
            first_name,
            last_name
          )
        `);

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }
      if (filters.propertyId !== "all") {
        query = query.eq("property_id", filters.propertyId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }
      
      console.log("Fetched maintenance requests:", data);
      return data;
    },
  });

  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers-details"],
    enabled: activeSection === "providers",
    queryFn: async () => {
      console.log("Fetching service providers with details");
      
      // First get the landlord's preferred providers
      const { data: preferredProviders, error: preferredError } = await supabase
        .from("landlord_service_providers")
        .select("service_provider_id")
        .eq('landlord_id', currentUserId);

      if (preferredError) {
        console.error("Error fetching preferred providers:", preferredError);
        throw preferredError;
      }

      // Then get all service providers with their profile information
      const { data: allProviders, error: allError } = await supabase
        .from("service_provider_profiles")
        .select(`
          *,
          profile:profiles(
            first_name,
            last_name
          ),
          services:service_provider_services(
            name,
            category,
            base_price,
            price_unit
          )
        `);

      if (allError) {
        console.error("Error fetching all providers:", allError);
        throw allError;
      }

      // Create a set of preferred provider IDs for quick lookup
      const preferredIds = new Set(preferredProviders?.map(p => p.service_provider_id) || []);

      // Mark providers as preferred or available and format the data
      const formattedProviders: ServiceProvider[] = (allProviders || []).map(provider => ({
        ...provider,
        isPreferred: preferredIds.has(provider.id),
        // Extract profile information from the joined data
        profiles: {
          first_name: provider.profile?.first_name || '',
          last_name: provider.profile?.last_name || ''
        }
      }));

      // Sort providers: preferred first, then by name
      return formattedProviders.sort((a, b) => {
        if (a.isPreferred === b.isPreferred) {
          return (a.profiles?.first_name || '').localeCompare(b.profiles?.first_name || '');
        }
        return a.isPreferred ? -1 : 1;
      });
    },
  });

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedRequestId(undefined);
    setIsDialogOpen(false);
  };

  const activeRequests = maintenanceRequests?.filter(
    (request) => request.status !== "completed"
  ) || [];

  const completedRequests = maintenanceRequests?.filter(
    (request) => request.status === "completed"
  ) || [];

  const navigationItems = [
    {
      id: 'requests' as MaintenanceSection,
      label: t("maintenance.requests"),
      icon: List,
    },
    {
      id: 'providers' as MaintenanceSection,
      label: t("maintenance.serviceProviders"),
      icon: Users,
    },
  ];

  const renderServiceProviderList = () => {
    if (!serviceProviders?.length) {
      return (
        <NoDataCard
          title={t("maintenance.noServiceProviders")}
          message={t("maintenance.noServiceProvidersMessage")}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceProviders.map((provider: ServiceProvider) => (
          <Card key={provider.id} className={cn(
            "p-6 space-y-4",
            provider.isPreferred && "border-2 border-primary"
          )}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {provider.business_name || `${provider.profiles.first_name} ${provider.profiles.last_name}`}
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
                  ⭐ {provider.rating.toFixed(1)}
                  {provider.review_count > 0 && (
                    <span className="text-xs">({provider.review_count})</span>
                  )}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {provider.services?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service, idx) => (
                      <Badge key={idx} variant="outline">
                        {service.name}
                        {service.base_price && (
                          <span className="ml-1">
                            (${service.base_price}/{service.price_unit})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {provider.service_area?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Service Areas:</h4>
                  <div className="flex flex-wrap gap-1">
                    {provider.service_area.map((area, idx) => (
                      <Badge key={idx} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 pt-4">
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
              {userRole === 'landlord' && (
                <Button
                  variant="outline"
                  onClick={async () => {
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
                      // Refetch the providers list
                      queryClient.invalidateQueries({ queryKey: ['service-providers-details'] });
                      
                      toast({
                        title: provider.isPreferred ? "Removed from preferred providers" : "Added to preferred providers",
                        description: `${provider.profiles.first_name} ${provider.profiles.last_name} has been ${provider.isPreferred ? 'removed from' : 'added to'} your preferred providers list.`,
                      });
                    } catch (error) {
                      console.error('Error updating preferred status:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update preferred status. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {provider.isPreferred ? 'Remove from Preferred' : 'Add to Preferred'}
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => handleRequestClick(undefined)}
              >
                Create Maintenance Request
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8 space-y-8">
          <div className="flex justify-between items-center bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {t("maintenance.title")}
                </h1>
              </div>
              <p className="text-gray-500 max-w-2xl">
                {t("maintenance.description")}
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("maintenance.newRequest")}
            </Button>
          </div>

          <div className="w-full flex gap-4 bg-card p-4 rounded-lg shadow-sm overflow-x-auto">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className={cn(
                  "flex-shrink-0 gap-2",
                  activeSection === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {activeSection === "requests" ? (
            <>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <MaintenanceFilters filters={filters} onFiltersChange={setFilters} />
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {t("maintenance.activeRequests")}
                </h2>
                {isLoading ? (
                  <Card className="p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </Card>
                ) : activeRequests.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <MaintenanceList
                      requests={activeRequests}
                      isLoading={false}
                      onRequestClick={handleRequestClick}
                    />
                  </div>
                ) : (
                  <NoDataCard 
                    title={t("maintenance.noActiveRequests")}
                    message={t("maintenance.noActiveRequestsMessage")}
                  />
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {t("maintenance.completedRequests")}
                </h2>
                {isLoading ? (
                  <Card className="p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </Card>
                ) : completedRequests.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <MaintenanceList
                      requests={completedRequests}
                      isLoading={false}
                      onRequestClick={handleRequestClick}
                    />
                  </div>
                ) : (
                  <NoDataCard 
                    title={t("maintenance.noCompletedRequests")}
                    message={t("maintenance.noCompletedRequestsMessage")}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                {t("maintenance.serviceProviders")}
              </h2>
              {renderServiceProviderList()}
            </div>
          )}

          <MaintenanceDialog
            open={isDialogOpen}
            onOpenChange={handleDialogClose}
            requestId={selectedRequestId}
          />
        </div>
      </div>
    </div>
  );
}
