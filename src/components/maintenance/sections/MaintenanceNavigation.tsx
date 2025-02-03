import React from "react";
import { Button } from "@/components/ui/button";
import { List, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: 'requests' | 'providers';
  label: string;
  icon: React.ElementType;
}

interface MaintenanceNavigationProps {
  activeSection: 'requests' | 'providers';
  onSectionChange: (section: 'requests' | 'providers') => void;
  showProviders: boolean;
}

export function MaintenanceNavigation({ 
  activeSection, 
  onSectionChange,
  showProviders 
}: MaintenanceNavigationProps) {
  const { t } = useTranslation();

  const navigationItems: NavigationItem[] = showProviders ? [
    {
      id: 'requests',
      label: t("maintenance.requests"),
      icon: List,
    },
    {
      id: 'providers',
      label: t("maintenance.serviceProviders"),
      icon: Users,
    },
  ] : [
    {
      id: 'requests',
      label: t("maintenance.requests"),
      icon: List,
    }
  ];

  return (
    <div className="w-full flex gap-4 bg-card p-4 rounded-lg shadow-sm overflow-x-auto">
      {navigationItems.map((item) => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? 'default' : 'ghost'}
          className={cn(
            "flex-shrink-0 gap-2",
            activeSection === item.id && "bg-primary text-primary-foreground"
          )}
          onClick={() => onSectionChange(item.id)}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </div>
  );
}