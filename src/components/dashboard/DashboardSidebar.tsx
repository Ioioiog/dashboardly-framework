import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  FileText,
  Receipt,
  DollarSign,
  Zap,
  Settings,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "dashboard.menu.dashboard",
    href: "/dashboard",
  },
  {
    icon: Building2,
    label: "dashboard.menu.properties",
    href: "/properties",
  },
  {
    icon: Users,
    label: "dashboard.menu.tenants",
    href: "/tenants",
  },
  {
    icon: Wrench,
    label: "dashboard.menu.maintenance",
    href: "/maintenance",
  },
  {
    icon: FileText,
    label: "dashboard.menu.documents",
    href: "/documents",
  },
  {
    icon: Receipt,
    label: "Invoices",
    href: "/invoices",
  },
  {
    icon: DollarSign,
    label: "dashboard.menu.payments",
    href: "/payments",
  },
  {
    icon: Zap,
    label: "dashboard.menu.utilities",
    href: "/utilities",
  },
  {
    icon: Settings,
    label: "dashboard.menu.settings",
    href: "/settings",
  },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <div className="fixed left-0 h-screen w-64 border-r bg-background p-6">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-4">
          <div className="mb-8">
            <h2 className="text-lg font-semibold">AdminChirii</h2>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    location.pathname === item.href && "bg-secondary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.label)}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {t("dashboard.menu.signout")}
        </Button>
      </div>
    </div>
  );
}
