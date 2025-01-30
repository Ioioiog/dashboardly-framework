import { useState } from "react";
import { Settings, Globe, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function FloatingSettingsBox() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const { availableCurrencies } = useCurrency();
  const { toast } = useToast();

  const handleLanguageChange = (value: string) => {
    localStorage.setItem('language', value);
    i18n.changeLanguage(value);
    toast({
      title: "Language Updated",
      description: "Your language preference has been saved.",
    });
  };

  const handleCurrencyChange = async (value: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('profiles')
        .update({ currency_preference: value })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Currency Updated",
        description: "Your currency preference has been saved.",
      });
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed top-16 right-4 z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 bg-white">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
          <div className="p-2 space-y-2">
            {/* Language Selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </label>
              <select
                className="w-full rounded-md border border-gray-200 p-2 text-sm"
                value={localStorage.getItem('language') || 'en'}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ro">Română</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency
              </label>
              <select
                className="w-full rounded-md border border-gray-200 p-2 text-sm"
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}