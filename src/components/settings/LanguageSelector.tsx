import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
] as const;

type LanguageCode = typeof languages[number]["code"];

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save the language preference to your backend
      // For now, we'll just show a success message
      localStorage.setItem("preferredLanguage", selectedLanguage);
      
      toast({
        title: "Success",
        description: "Language preference saved successfully",
      });
    } catch (error) {
      console.error("Error saving language preference:", error);
      toast({
        title: "Error",
        description: "Failed to save language preference",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language">Preferred Language</Label>
          <Select
            value={selectedLanguage}
            onValueChange={(value: LanguageCode) => setSelectedLanguage(value)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Language Preference"}
        </Button>
      </CardContent>
    </Card>
  );
}