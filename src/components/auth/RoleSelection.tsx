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
              className="group relative flex flex-col items-center p-8 rounded-[2.5rem]
                       transition-all duration-300 
                       hover:shadow-2xl hover:shadow-blue-500/10
                       bg-transparent
                       backdrop-blur-[2px]
                       transform hover:-translate-y-1 hover:scale-[1.02]
                       animate-fade-in
                       before:absolute before:inset-0 before:rounded-[2.5rem] 
                       before:bg-gradient-to-br before:from-transparent before:to-transparent
                       before:transition-colors before:duration-300
                       hover:before:from-blue-500/[0.02] hover:before:to-blue-600/[0.02]
                       after:absolute after:inset-0 after:rounded-[2.5rem] 
                       after:border after:border-white/5 after:dark:border-slate-700/5"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              <div className="relative mb-6 p-5 rounded-2xl 
                            bg-transparent
                            transition-all duration-300 transform 
                            group-hover:scale-110 group-hover:rotate-3
                            before:absolute before:inset-0 before:rounded-2xl
                            before:bg-gradient-to-br before:from-blue-500/[0.01] before:to-blue-600/[0.01]
                            before:opacity-0 group-hover:before:opacity-100
                            before:transition-opacity before:duration-300">
                <Icon className="w-10 h-10 text-blue-500 dark:text-blue-400 
                               transition-all duration-500
                               group-hover:rotate-[360deg] group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200
                           transition-colors duration-300 
                           group-hover:text-blue-600 dark:group-hover:text-blue-400
                           relative z-10">
                {role.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center
                          transition-colors duration-300 
                          group-hover:text-gray-600 dark:group-hover:text-gray-300
                          relative z-10">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}