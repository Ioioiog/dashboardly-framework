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
  LogOut,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
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

export const DashboardSidebar = () => {
  const { userRole } = useUserRole();
  const location = useLocation();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);

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
    
    const linkContent = (
      <div
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          !isExpanded && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-5 w-5", active && "text-primary")} />
        {isExpanded && <span className="ml-3">{item.title}</span>}
      </div>
    );

    return isExpanded ? (
      <Link to={item.href}>{linkContent}</Link>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.href}>{linkContent}</Link>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Collapsible
        defaultOpen={true}
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className={cn(
          "relative h-screen bg-background border-r border-border flex flex-col transition-all duration-300",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/ee7b7c5d-7f56-451d-800e-19c3beac7ebd.png" 
              alt="AdminChirii.ro Logo" 
              className="h-8"
            />
            {isExpanded && <span className="font-semibold">AdminChirii.ro</span>}
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent
          forceMount
          className="flex-1 overflow-y-auto py-2 px-2"
        >
          <nav className="space-y-1">
            {filteredMenuItems.map((item) => (
              <MenuItem key={item.href} item={item} />
            ))}
          </nav>
        </CollapsibleContent>
        <div className="p-4 border-t border-border">
          {isExpanded ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </Collapsible>
    </TooltipProvider>
  );
};

export default DashboardSidebar;