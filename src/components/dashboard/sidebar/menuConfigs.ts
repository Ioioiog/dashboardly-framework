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
  Clipboard,
  UserCog,
  Building2,
  Wallet,
} from "lucide-react";

export const serviceProviderMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["service_provider"],
    notificationType: "maintenance"
  },
  {
    title: "Profile",
    icon: UserCog,
    href: "/service-provider-profile",
    roles: ["service_provider"],
  },
  {
    title: "Service Areas",
    icon: Building2,
    href: "/service-areas",
    roles: ["service_provider"],
  },
  {
    title: "Services",
    icon: Wrench,
    href: "/services",
    roles: ["service_provider"],
  },
  {
    title: "Job Requests",
    icon: Clipboard,
    href: "/maintenance",
    roles: ["service_provider"],
    notificationType: "maintenance"
  },
  {
    title: "Earnings",
    icon: Wallet,
    href: "/earnings",
    roles: ["service_provider"],
    notificationType: "payments"
  },
  {
    title: "Messages",
    icon: MessageCircle,
    href: "/chat",
    roles: ["service_provider"],
    notificationType: "messages"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["service_provider"],
  },
];

export const standardMenuItems = [
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
    title: "Financial",
    icon: Wallet,
    href: "/financial",
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
    title: "Meter Readings",
    icon: Clipboard,
    href: "/meter-readings",
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
