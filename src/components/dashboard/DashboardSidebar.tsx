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
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface MenuItem {
  icon: React.ElementType;
  labelKey: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, labelKey: "navigation.dashboard", path: "/dashboard" },
  { icon: Home, labelKey: "navigation.properties", path: "/properties" },
  { icon: Users, labelKey: "navigation.tenants", path: "/tenants" },
  { icon: Wrench, labelKey: "navigation.maintenance", path: "/maintenance" },
  { icon: FileText, labelKey: "navigation.documents", path: "/documents" },
  { icon: CreditCard, labelKey: "navigation.payments", path: "/payments" },
  { icon: Zap, labelKey: "navigation.utilities", path: "/utilities" },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process");
      await supabase.auth.signOut({ scope: 'local' });
      console.log("Local session cleared");
      console.log("Navigating to auth page");
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
        <div className="p-8 border-b border-gray-100">
          <div className={`transition-opacity duration-200 ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}>
            <h1 className="text-2xl font-bold text-center">
              <span className="text-blue-600">Property</span>
              <span className="text-blue-800">Manager</span>
            </h1>
            <p className="text-xs text-slate-500 mt-2 text-center">Simplify your property management</p>
          </div>
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.labelKey}>
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
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-100 space-y-2">
          <Link
            to="/settings"
            className="flex items-center w-full text-dashboard-text hover:text-gray-900 transition-colors duration-200"
          >
            <Settings className="h-5 w-5" />
            <span
              className={`ml-3 transition-opacity duration-200 ${
                isCollapsed ? "opacity-0 hidden" : "opacity-100"
              }`}
            >
              {t('navigation.settings')}
            </span>
          </Link>
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
              {t('navigation.logout')}
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