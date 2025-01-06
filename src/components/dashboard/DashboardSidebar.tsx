import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  Wrench,
  FileText,
  CreditCard,
  Zap,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Home, label: "Properties", path: "/properties" },
  { icon: Users, label: "Tenants", path: "/tenants" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: Zap, label: "Utilities", path: "/utilities" },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error during signOut:", error);
          throw error;
        }
      }
      
      // Always navigate to auth page, even if there was no session
      console.log("Navigating to auth page after logout");
      navigate("/auth");
      
    } catch (error) {
      console.error("Error during logout process:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`bg-dashboard-sidebar h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } border-r border-gray-200 shadow-sm`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
          <h1
            className={`text-xl font-semibold transition-opacity duration-200 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            PropertyHub
          </h1>
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-dashboard-text hover:bg-dashboard-accent transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-dashboard-accent text-gray-900 font-medium"
                      : ""
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      location.pathname === item.path
                        ? "text-gray-900"
                        : "text-dashboard-text"
                    }`}
                  />
                  <span
                    className={`ml-3 transition-opacity duration-200 ${
                      isCollapsed ? "opacity-0 hidden" : "opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-dashboard-text hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span
              className={`ml-3 transition-opacity duration-200 ${
                isCollapsed ? "opacity-0 hidden" : "opacity-100"
              }`}
            >
              Logout
            </span>
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <svg
            className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </aside>
  );

};

export default DashboardSidebar;
