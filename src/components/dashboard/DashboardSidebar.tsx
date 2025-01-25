import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Home,
  Users,
  Wrench,
  FileText,
  CreditCard,
  Settings,
  Droplets,
  LogOut,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  BellDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";

interface Notification {
  type: string;
  count: number;
}

export const DashboardSidebar = () => {
  const { userRole } = useUserRole();
  const location = useLocation();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("Fetching notifications...");
      
      const [maintenanceResponse, messagesResponse, paymentsResponse] = await Promise.all([
        // Get pending maintenance requests
        supabase
          .from("maintenance_requests")
          .select("id")
          .eq("status", "pending")
          .eq(userRole === "landlord" ? "assigned_to" : "tenant_id", await supabase.auth.getUser().then(res => res.data.user?.id)),
        
        // Get unread messages
        supabase
          .from("messages")
          .select("id")
          .eq("status", "sent")
          .eq("receiver_id", await supabase.auth.getUser().then(res => res.data.user?.id)),
        
        // Get pending payments
        supabase
          .from("payments")
          .select("id")
          .eq("status", "pending")
          .gte("due_date", new Date().toISOString())
      ]);

      console.log("Notifications fetched:", {
        maintenance: maintenanceResponse.data?.length,
        messages: messagesResponse.data?.length,
        payments: paymentsResponse.data?.length
      });

      return [
        { type: "maintenance", count: maintenanceResponse.data?.length || 0 },
        { type: "messages", count: messagesResponse.data?.length || 0 },
        { type: "payments", count: paymentsResponse.data?.length || 0 }
      ] as Notification[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const getNotificationCount = (type: string) => {
    return notifications?.find(n => n.type === type)?.count || 0;
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const notificationCount = item.notificationType ? getNotificationCount(item.notificationType) : 0;
    
    const linkContent = (
      <div
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-300",
          !isExpanded && "justify-center px-2"
        )}
      >
        <div className="relative">
          <Icon className={cn("h-5 w-5", active && "text-blue-600 dark:text-blue-400")} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white dark:ring-gray-900">
              {notificationCount}
            </span>
          )}
        </div>
        {isExpanded && <span className="ml-3">{item.title}</span>}
      </div>
    );

    if (isExpanded) {
      return <Link to={item.href}>{linkContent}</Link>;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={item.href}>{linkContent}</Link>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="bg-white dark:bg-gray-900 text-sm">
            <div className="flex items-center gap-2">
              {item.title}
              {notificationCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {notificationCount}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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
        <div className="flex items-center justify-center gap-2">
          <img 
            src="/lovable-uploads/9c23bc1b-4e8c-433e-a961-df606dc6a2c6.png" 
            alt="AdminChirii.ro Logo" 
            className="h-8 w-8 rounded-lg shadow-sm"
          />
          {isExpanded && (
            <div className="flex flex-col items-start">
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                AdminChirii.ro
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">simplificăm administrarea</span>
            </div>
          )}
        </div>
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
          {filteredMenuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            const linkContent = (
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-300",
                  !isExpanded && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-blue-600 dark:text-blue-400")} />
                {isExpanded && <span className="ml-3">{item.title}</span>}
              </div>
            );

            return isExpanded ? (
              <Link key={item.href} to={item.href}>
                {linkContent}
              </Link>
            ) : (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.href}>{linkContent}</Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="bg-white dark:bg-gray-900 text-sm">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </CollapsibleContent>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {isExpanded ? (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-900 text-sm">Sign Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Collapsible>
  );
};

export default DashboardSidebar;
