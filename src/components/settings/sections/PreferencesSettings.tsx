import { LanguageSelector } from "../LanguageSelector";

export function PreferencesSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Preferences Settings</h2>
      <LanguageSelector />
    </div>
  );
}