import React, { useState } from "react";
import {
  LayoutDashboard,
  Home,
  Users,
  Wrench,
  FileText,
  CreditCard,
  Settings,
  Droplets,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebarNotifications } from "@/hooks/use-sidebar-notifications";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";
import { SignOutButton } from "./sidebar/SignOutButton";

export const DashboardSidebar = () => {
  const { userRole } = useUserRole();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: notifications, markAsRead } = useSidebarNotifications();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Properties",
      icon: Home,
      href: "/properties",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Tenants",
      icon: Users,
      href: "/tenants",
      roles: ["landlord"],
    },
    {
      title: "Maintenance",
      icon: Wrench,
      href: "/maintenance",
      roles: ["landlord", "tenant"],
      notificationType: "maintenance"
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/documents",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Invoices",
      icon: FileText,
      href: "/invoices",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Payments",
      icon: CreditCard,
      href: "/payments",
      roles: ["landlord", "tenant"],
      notificationType: "payments"
    },
    {
      title: "Utilities",
      icon: Droplets,
      href: "/utilities",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Chat",
      icon: MessageCircle,
      href: "/chat",
      roles: ["landlord", "tenant"],
      notificationType: "messages"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["landlord", "tenant"],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !userRole || item.roles.includes(userRole)
  );

  const handleNotificationClick = (type: string) => {
    console.log(`Marking ${type} notifications as read`);
    markAsRead(type);
  };

  return (
    <Collapsible
      defaultOpen={true}
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        "relative h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 shadow-sm",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <SidebarLogo isExpanded={isExpanded} />
      </div>
      
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-7 w-7 rounded-full border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg hover:shadow-md hover:bg-white/90 transition-all duration-200 dark:bg-gray-950/80 dark:hover:bg-gray-950/90 dark:border-gray-800"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent
        forceMount
        className="flex-1 overflow-y-auto py-4 px-3"
      >
        <nav className="space-y-1.5">
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              isExpanded={isExpanded}
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
            />
          ))}
        </nav>
      </CollapsibleContent>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <SignOutButton isExpanded={isExpanded} />
      </div>
    </Collapsible>
  );
};

export default DashboardSidebar;