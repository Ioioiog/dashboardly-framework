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
    },
    {
      id: "landlord",
      title: "Landlord",
      description: "Manage your properties and tenants",
      icon: Building2,
    },
    {
      id: "service_provider",
      title: "Service Provider",
      description: "Offer maintenance and repair services",
      icon: Wrench,
    },
  ];

  return (
    <>
      <div className="text-center pb-8 animate-fade-in">
        <CardTitle className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Choose Your Role
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
          Select how you'll use AdminChirii
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className="flex flex-col items-center p-8 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 bg-white/50 dark:bg-slate-800/50 group"
            >
              <div className="mb-4 p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 transition-transform group-hover:scale-110">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}