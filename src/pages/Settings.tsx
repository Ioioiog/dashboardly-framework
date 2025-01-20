import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { AccountSettings } from "@/components/settings/sections/AccountSettings";
import { FinancialSettings } from "@/components/settings/sections/FinancialSettings";
import { PropertyProvidersSettings } from "@/components/settings/sections/PropertyProvidersSettings";
import { PreferencesSettings } from "@/components/settings/sections/PreferencesSettings";
import { cn } from "@/lib/utils";

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

  const navigationItems = [
    { id: 'account', label: 'Account Settings' },
    { id: 'financial', label: 'Financial & Payments' },
    { id: 'providers', label: 'Property Providers' },
    { id: 'preferences', label: 'Preferences' },
  ] as const;

  return (
    <div className="flex h-screen bg-dashboard-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="pb-6 border-b border-border/10">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Settings Navigation - Now styled as a card */}
            <div className="lg:w-64 shrink-0">
              <nav className="sticky top-8 space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start text-left font-medium",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Settings Content - Now with animation */}
            <div className="flex-1 min-w-0">
              <div className="animate-fade-in">
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;