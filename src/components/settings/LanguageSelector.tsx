import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    localStorage.setItem('language', value);
    i18n.changeLanguage(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Select defaultValue={localStorage.getItem('language') || 'en'} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="ro">Română</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}