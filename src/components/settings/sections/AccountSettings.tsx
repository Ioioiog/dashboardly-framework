import { PersonalInfoForm } from "../PersonalInfoForm";
import { PasswordForm } from "../PasswordForm";

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Account Settings</h2>
      <PersonalInfoForm />
      <PasswordForm />
    </div>
  );
}