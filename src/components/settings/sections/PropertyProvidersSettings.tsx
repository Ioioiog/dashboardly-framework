import { UtilityProviderForm } from "../UtilityProviderForm";
import { useUserRole } from "@/hooks/use-user-role";

export function PropertyProvidersSettings() {
  const { userRole } = useUserRole();

  if (userRole !== 'landlord') {
    return null;
  }

  return (
    <div className="space-y-6">
      <UtilityProviderForm />
    </div>
  );
}