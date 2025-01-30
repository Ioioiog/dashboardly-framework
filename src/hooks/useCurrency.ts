import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CurrencyPreference {
  currency_preference: string;
}

const exchangeRates = {
  USD: 1,
  EUR: 0.92, // Example fixed rate USD to EUR
  RON: 4.56, // Example fixed rate USD to RON
};

export function useCurrency() {
  const { data: preference } = useQuery({
    queryKey: ["currency-preference"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("currency_preference")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as CurrencyPreference;
    },
  });

  const formatAmount = (amount: number) => {
    const currency = preference?.currency_preference || 'USD';
    const rate = exchangeRates[currency as keyof typeof exchangeRates] || 1;
    const convertedAmount = amount * rate;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(convertedAmount);
  };

  return {
    formatAmount,
    currency: preference?.currency_preference || 'USD'
  };
}