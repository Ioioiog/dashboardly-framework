import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { AccountSettings } from "@/components/settings/sections/AccountSettings";
import { FinancialSettings } from "@/components/settings/sections/FinancialSettings";
import { PropertyProvidersSettings } from "@/components/settings/sections/PropertyProvidersSettings";
import { PreferencesSettings } from "@/components/settings/sections/PreferencesSettings";
import { UtilityReadingPeriodsSettings } from "@/components/settings/sections/UtilityReadingPeriodsSettings";
import { Settings2, Wallet, Building2, Languages, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSection = 'account' | 'financial' | 'providers' | 'reading-periods' | 'preferences';

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
      id: 'reading-periods' as SettingsSection,
      label: 'Reading Periods',
      icon: Calendar,
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
      case 'reading-periods':
        return <UtilityReadingPeriodsSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
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

          <div className="bg-card p-6 rounded-lg shadow-sm">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;