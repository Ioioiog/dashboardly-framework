import { LanguageSelector } from "../LanguageSelector";
import { CurrencySelector } from "../CurrencySelector";

export function PreferencesSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Preferences Settings</h2>
      <LanguageSelector />
      <CurrencySelector />
    </div>
  );
}