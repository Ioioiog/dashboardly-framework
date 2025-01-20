import { PasswordForm } from "./PasswordForm";
import { StripeAccountForm } from "./StripeAccountForm";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <PasswordForm />
      <StripeAccountForm />
    </div>
  );
}