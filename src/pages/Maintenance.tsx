import { useState } from "react";
import { Card } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { MaintenanceNavigation } from "@/components/maintenance/sections/MaintenanceNavigation";
import { RequestsSection } from "@/components/maintenance/sections/RequestsSection";
import { ServiceProviderList } from "@/components/maintenance/ServiceProviderList";
import { useUserRole } from "@/hooks/use-user-role";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";

const Maintenance = () => {
  const [activeSection, setActiveSection] = useState<'requests' | 'providers'>('requests');
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const { userRole } = useUserRole();
  const { t } = useTranslation();
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
    }
  });

  const handleRequestClick = (requestId: string) => {
    console.log("Request clicked:", requestId);
    setSelectedRequestId(requestId);
  };

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
              title={t("maintenance.requests")}
              requests={requests || []}
              emptyTitle={t("maintenance.noRequests")}
              emptyMessage={t("maintenance.createRequest")}
              isLoading={isLoading}
              onRequestClick={handleRequestClick}
            />
          ) : (
            showProviders && <ServiceProviderList />
          )}

          <MaintenanceDialog
            open={!!selectedRequestId}
            onOpenChange={(open) => !open && setSelectedRequestId(undefined)}
            requestId={selectedRequestId}
          />
        </div>
      </div>
    </div>
  );
};

export default Maintenance;