import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { AccountSettings } from "@/components/settings/sections/AccountSettings";
import { FinancialSettings } from "@/components/settings/sections/FinancialSettings";
import { PropertyProvidersSettings } from "@/components/settings/sections/PropertyProvidersSettings";
import { PreferencesSettings } from "@/components/settings/sections/PreferencesSettings";

type SettingsSection = 'account' | 'financial' | 'providers' | 'preferences';

const Settings = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'financial':
        return <FinancialSettings />;
      case 'providers':
        return <PropertyProvidersSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-dashboard-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Navigation */}
            <div className="lg:w-64 space-y-2">
              <Button
                variant={activeSection === 'account' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('account')}
              >
                Account Settings
              </Button>
              <Button
                variant={activeSection === 'financial' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('financial')}
              >
                Financial & Payments
              </Button>
              <Button
                variant={activeSection === 'providers' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('providers')}
              >
                Property Providers
              </Button>
              <Button
                variant={activeSection === 'preferences' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('preferences')}
              >
                Preferences
              </Button>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;