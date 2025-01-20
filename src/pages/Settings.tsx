import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { AccountSettings } from "@/components/settings/sections/AccountSettings";
import { FinancialSettings } from "@/components/settings/sections/FinancialSettings";
import { PropertyProvidersSettings } from "@/components/settings/sections/PropertyProvidersSettings";
import { PreferencesSettings } from "@/components/settings/sections/PreferencesSettings";
import { Settings2, Wallet, Building2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSection = 'account' | 'financial' | 'providers' | 'preferences';

const Settings = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  const navigationItems = [
    {
      id: 'account' as SettingsSection,
      label: 'Account Settings',
      icon: Settings2,
    },
    {
      id: 'financial' as SettingsSection,
      label: 'Financial & Payments',
      icon: Wallet,
    },
    {
      id: 'providers' as SettingsSection,
      label: 'Property Providers',
      icon: Building2,
    },
    {
      id: 'preferences' as SettingsSection,
      label: 'Preferences',
      icon: Languages,
    },
  ];

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
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Navigation */}
            <div className="lg:w-64 space-y-2 bg-card p-4 rounded-lg shadow-sm">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className={cn(
                    "w-full justify-start gap-2",
                    activeSection === item.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="flex-1 bg-card p-6 rounded-lg shadow-sm">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;