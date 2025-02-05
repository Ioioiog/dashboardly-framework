import { useState } from "react";
import { Card } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { MaintenanceNavigation } from "@/components/maintenance/sections/MaintenanceNavigation";
import { RequestsSection } from "@/components/maintenance/sections/RequestsSection";
import { ServiceProviderList } from "@/components/maintenance/ServiceProviderList";
import { useUserRole } from "@/hooks/use-user-role";

const Maintenance = () => {
  const [activeSection, setActiveSection] = useState<'requests' | 'providers'>('requests');
  const { userRole } = useUserRole();
  const showProviders = userRole === "landlord";

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
            <RequestsSection />
          ) : (
            showProviders && <ServiceProviderList />
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;