import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useSettingsSync } from "@/hooks/useSettingsSync";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  useSettingsSync(); // Add real-time sync

  const handleLanguageChange = async (value: string) => {
    try {
      setIsLoading(true);
      console.log('Updating language preference to:', value);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          settings: {
            language: value,
            currency: localStorage.getItem('currency') || 'USD',
            theme: 'light'
          }
        })
        .eq('id', user?.id);

      if (error) throw error;

      localStorage.setItem('language', value);
      i18n.changeLanguage(value);

      toast({
        title: "Success",
        description: "Language updated successfully. Reloading page...",
      });

      // Force a hard reload after a short delay
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1500);

    } catch (error) {
      console.error('Error updating language:', error);
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Select 
          defaultValue={localStorage.getItem('language') || 'en'} 
          onValueChange={handleLanguageChange}
          disabled={isLoading}
        >
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