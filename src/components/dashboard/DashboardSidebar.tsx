import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wrench,
  Receipt,
  Settings,
  Droplets,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Sign out successful");
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Properties",
      icon: Building2,
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
      title: "Documents",
      icon: FileText,
      href: "/documents",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Maintenance",
      icon: Wrench,
      href: "/maintenance",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Payments",
      icon: Receipt,
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
      title: "Invoices",
      icon: FileText,
      href: "/invoices",
      roles: ["landlord", "tenant"],
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["landlord", "tenant"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : item.roles.includes("tenant")
  );

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-dashboard-sidebar border-r border-gray-200 shadow-sm animate-slide-in">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-6">
          <div className="p-4 border-b border-gray-100">
            <img 
              src="/lovable-uploads/a279fbbc-be90-4a4b-afe5-ae98a7d6c04d.png" 
              alt="AdminChirii.ro" 
              className="h-16 w-auto transition-transform hover:scale-105"
            />
          </div>
          <nav className="px-2 space-y-1">
            {filteredMenuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex w-full items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  "hover:bg-dashboard-accent hover:text-dashboard-text hover:shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                  window.location.pathname === item.href
                    ? "bg-dashboard-accent text-dashboard-text shadow-sm"
                    : "text-dashboard-text-muted hover:text-dashboard-text"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-500 rounded-lg transition-all duration-200 hover:bg-red-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}