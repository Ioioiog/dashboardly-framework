import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useSettingsSync } from "@/hooks/useSettingsSync";
import { useQueryClient } from "@tanstack/react-query";

const currencies = [
  { value: 'USD', label: '🇺🇸 USD - US Dollar (USD)' },
  { value: 'EUR', label: '🇪🇺 EUR - Euro (EUR)' },
  { value: 'RON', label: '🇷🇴 RON - Romanian Leu (RON)' },
];

export function CurrencySelector() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

      // Update localStorage first
      localStorage.setItem('currency', value);
      
      // Invalidate the currency preference query
      queryClient.invalidateQueries({ queryKey: ['currency-preference'] });

      toast({
        title: "Success",
        description: "Currency preference updated successfully. Reloading page...",
      });

      // Force a hard reload after a short delay
      setTimeout(() => {
        window.location.href = window.location.href;
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
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Current Exchange Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex justify-center">
            <iframe 
              className="rounded-lg shadow-sm"
              style={{ width: "200px", height: "95px" }} 
              frameBorder="0" 
              scrolling="no" 
              src="https://www.cursbnr.ro/insert/cursvalutar.php?w=200&b=f7f7f7&bl=dcdcdc&ttc=0a6eab&tc=000000&diff=1&ron=1&cb=1&pics=1"
              title="BNR Exchange Rates"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}