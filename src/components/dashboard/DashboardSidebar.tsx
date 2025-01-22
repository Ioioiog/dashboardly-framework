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
  MessageCircle,
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
      console.log("Starting sign out process...");
      
      // First clear any existing session data from localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      
      // Attempt to sign out with local scope only
      const { error } = await supabase.auth.signOut({ 
        scope: 'local'
      });
      
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      navigate("/auth", { replace: true });
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Even if there's an error, we want to redirect to auth
      // since the session is likely invalid anyway
      navigate("/auth", { replace: true });
      
      toast({
        variant: "destructive",
        title: "Sign out completed with warnings",
        description: "You have been signed out, but there were some warnings. Please sign in again.",
      });
    }
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

  const filteredMenuItems = menuItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : item.roles.includes("tenant")
  );

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-dashboard-sidebar border-r border-gray-200">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-4">
          <div className="mb-8 p-4">
            <img 
              src="/lovable-uploads/a279fbbc-be90-4a4b-afe5-ae98a7d6c04d.png" 
              alt="AdminChirii.ro" 
              className="h-20 w-auto"
            />
          </div>
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex w-full items-center space-x-2 px-4 py-2 text-dashboard-text hover:bg-dashboard-accent hover:text-dashboard-text transition-colors",
                  window.location.pathname === item.href &&
                    "bg-dashboard-accent text-dashboard-text"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}