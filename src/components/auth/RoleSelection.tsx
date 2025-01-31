import { Building2, Home, Wrench } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";

interface RoleSelectionProps {
  onRoleSelect: (role: string) => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <>
      <div className="text-center pb-8">
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Choose Your Role
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Select your role to continue
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onRoleSelect("tenant")}
          className="flex flex-col items-center p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 bg-white/50 dark:bg-slate-800/50"
        >
          <Home className="w-8 h-8 mb-3 text-blue-500" />
          <span className="font-medium">Tenant</span>
        </button>

        <button
          onClick={() => onRoleSelect("landlord")}
          className="flex flex-col items-center p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 bg-white/50 dark:bg-slate-800/50"
        >
          <Building2 className="w-8 h-8 mb-3 text-blue-500" />
          <span className="font-medium">Landlord</span>
        </button>

        <button
          onClick={() => onRoleSelect("service_provider")}
          className="flex flex-col items-center p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 bg-white/50 dark:bg-slate-800/50"
        >
          <Wrench className="w-8 h-8 mb-3 text-blue-500" />
          <span className="font-medium">Service Provider</span>
        </button>
      </div>
    </>
  );
}