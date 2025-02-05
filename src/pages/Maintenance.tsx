import { useState } from "react";
import { Card } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { MaintenanceNavigation } from "@/components/maintenance/sections/MaintenanceNavigation";
import { RequestsSection } from "@/components/maintenance/sections/RequestsSection";
import { ServiceProviderList } from "@/components/maintenance/ServiceProviderList";
import { useUserRole } from "@/hooks/use-user-role";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";

const Maintenance = () => {
  const [activeSection, setActiveSection] = useState<'requests' | 'providers'>('requests');
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  const showProviders = userRole === "landlord";

  const { data: requests, isLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      console.log("Fetching maintenance requests");
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          property:properties(name),
          tenant:profiles!maintenance_requests_tenant_id_fkey(
            first_name,
            last_name
          )
        `);

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      console.log("Fetched maintenance requests:", data);
      return data || [];
    },
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <Card className="mb-8">
            <MaintenanceNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              showProviders={showProviders}
            />
          </Card>

          {activeSection === 'requests' ? (
            <RequestsSection
              title="Maintenance Requests"
              requests={requests || []}
              emptyTitle="No maintenance requests"
              emptyMessage="There are no maintenance requests at the moment."
              isLoading={isLoading}
              onRequestClick={(id) => console.log("Request clicked:", id)}
            />
          ) : (
            showProviders && <ServiceProviderList />
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;