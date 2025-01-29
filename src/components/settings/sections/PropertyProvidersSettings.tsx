import { UtilityProviderForm } from "../UtilityProviderForm";
import { useUserRole } from "@/hooks/use-user-role";
import { UtilityReadingPeriodsSettings } from "./UtilityReadingPeriodsSettings";

export function PropertyProvidersSettings() {
  const { userRole } = useUserRole();

  if (userRole !== 'landlord') {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Property Providers Settings</h2>
      <UtilityProviderForm />
      <UtilityReadingPeriodsSettings />
    </div>
  );
}