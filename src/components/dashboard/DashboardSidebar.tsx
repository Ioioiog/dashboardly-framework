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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const { userRole } = useUserRole();

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
      title: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["landlord", "tenant"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole || "tenant")
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
            {menuItems.map((item) => (
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
      </div>
    </div>
  );
}