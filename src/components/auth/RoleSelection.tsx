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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className="group relative flex flex-col items-center p-8 rounded-xl border border-gray-100 dark:border-gray-800 
                       hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 
                       hover:shadow-xl hover:shadow-blue-500/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
                       transform hover:-translate-y-1 hover:scale-[1.02]
                       animate-fade-in"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              <div className="relative mb-4 p-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 
                            dark:from-blue-900/30 dark:to-blue-800/30 
                            group-hover:from-blue-100 group-hover:to-blue-200
                            dark:group-hover:from-blue-800/40 dark:group-hover:to-blue-700/40
                            transition-all duration-300 transform group-hover:scale-110">
                <Icon className="w-8 h-8 text-blue-500 dark:text-blue-400 
                               transition-transform duration-300 group-hover:rotate-[360deg]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200
                           transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {role.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center
                          transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {role.description}
              </p>
              <div className="absolute inset-0 rounded-xl bg-transparent 
                            group-hover:bg-gradient-to-br group-hover:from-blue-500/5 group-hover:to-blue-600/5 
                            dark:group-hover:from-blue-400/10 dark:group-hover:to-blue-500/10 
                            transition-all duration-300" />
            </button>
          );
        })}
      </div>
    </>
  );
}