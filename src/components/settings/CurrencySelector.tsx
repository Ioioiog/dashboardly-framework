import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useSettingsSync } from "@/hooks/useSettingsSync";

const currencies = [
  { value: 'USD', label: '🇺🇸 USD - US Dollar (USD)' },
  { value: 'EUR', label: '🇪🇺 EUR - Euro (EUR)' },
  { value: 'RON', label: '🇷🇴 RON - Romanian Leu (RON)' },
];

export function CurrencySelector() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  useSettingsSync(); // Add real-time sync

  const handleCurrencyChange = async (value: string) => {
    try {
      setIsLoading(true);
      console.log('Updating currency preference to:', value);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          currency_preference: value,
          settings: {
            currency: value,
            language: localStorage.getItem('language') || 'en',
            theme: 'light'
          }
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Currency preference updated successfully. Reloading page...",
      });

      // Reload the page after a short delay to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleCurrencyChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}