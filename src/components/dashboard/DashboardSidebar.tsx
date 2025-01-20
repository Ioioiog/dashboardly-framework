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
  FileInvoice,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  children: React.ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
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
      icon: FileInvoice,
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

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div className="space-y-6">
        <div className="p-4 border-b border-gray-100">
          <img 
            src="/lovable-uploads/a279fbbc-be90-4a4b-afe5-ae98a7d6c04d.png" 
            alt="AdminChirii.ro" 
            className="h-16 w-auto transition-transform hover:scale-105"
          />
        </div>
        <nav className="px-2 space-y-1.5">
          {filteredMenuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                "flex w-full items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                "hover:bg-gray-50 hover:text-primary hover:shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                "group relative",
                window.location.pathname === item.href
                  ? "bg-primary/5 text-primary shadow-sm"
                  : "text-gray-600"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                window.location.pathname === item.href
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              )} />
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 group"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200 bg-dashboard-sidebar">
          <SidebarContent>
            {sidebarContent}
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}