import { AccountSettings } from "./sections/AccountSettings";
import { FinancialSettings } from "./sections/FinancialSettings";

export function ProfileSettings() {
  return (
    <div className="space-y-6">
      <AccountSettings />
      <FinancialSettings />
    </div>
  );
}