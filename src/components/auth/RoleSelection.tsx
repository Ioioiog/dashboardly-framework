import { Building2, Home, Wrench } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";

interface RoleSelectionProps {
  onRoleSelect: (role: string) => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const roles = [
    {
      id: "tenant",
      title: "Tenant",
      description: "Find and manage your rental properties",
      icon: Home,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "landlord",
      title: "Landlord",
      description: "Manage your properties and tenants",
      icon: Building2,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "service_provider",
      title: "Service Provider",
      description: "Offer maintenance and repair services",
      icon: Wrench,
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <>
      <div className="text-center pb-8">
        <CardTitle className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Choose Your Role
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
          Select how you'll use AdminChirii
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className="group relative overflow-hidden rounded-xl p-px hover:scale-[1.01] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ backgroundImage: `linear-gradient(45deg, var(--${role.gradient}-start), var(--${role.gradient}-end))` }}>
              </div>
              <div className="relative flex items-center gap-4 rounded-xl bg-white dark:bg-gray-900 p-5 transition-transform">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${role.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {role.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}