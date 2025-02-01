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
        <CardTitle className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] animate-gradient">
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
              className="group relative flex flex-col items-center p-8 rounded-xl 
                       border border-white/20 hover:border-[#9b87f5]/50
                       transition-all duration-300 
                       hover:shadow-lg hover:shadow-[#9b87f5]/20 
                       bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
                       transform hover:-translate-y-1 hover:scale-[1.02]
                       animate-fade-in"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              <div className="relative mb-4 p-4 rounded-full 
                            bg-gradient-to-br from-[#E5DEFF] to-[#D6BCFA]
                            dark:from-[#9b87f5]/30 dark:to-[#7E69AB]/30 
                            group-hover:from-[#9b87f5]/20 group-hover:to-[#7E69AB]/20
                            transition-all duration-300 transform group-hover:scale-110">
                <Icon className="w-8 h-8 text-[#9b87f5] dark:text-[#D6BCFA] 
                               transition-transform duration-300 group-hover:rotate-[360deg]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200
                           transition-colors duration-300 group-hover:text-[#9b87f5] dark:group-hover:text-[#D6BCFA]">
                {role.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center
                          transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {role.description}
              </p>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#9b87f5]/0 to-[#7E69AB]/0 
                            group-hover:from-[#9b87f5]/5 group-hover:to-[#7E69AB]/5 
                            dark:group-hover:from-[#9b87f5]/10 dark:group-hover:to-[#7E69AB]/10 
                            transition-all duration-300" />
            </button>
          );
        })}
      </div>
    </>
  );
}