import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CurrencyPreference {
  currency_preference: string;
}

interface ExchangeRates {
  rates: {
    USD: number;
    EUR: number;
    RON: number;
  };
}

export function useCurrency() {
  // Fetch user's currency preference
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

  // Fetch exchange rates
  const { data: exchangeRates } = useQuery<ExchangeRates>({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      console.log('Fetching exchange rates...');
      const { data: { rates }, error } = await supabase.functions.invoke('get-exchange-rates');
      
      if (error) {
        console.error('Error fetching exchange rates:', error);
        // Fallback to default rates if API fails
        return {
          rates: {
            USD: 1,
            EUR: 0.92,
            RON: 4.56
          }
        };
      }

      console.log('Received exchange rates:', rates);
      return { rates };
    },
    // Cache for 1 hour since rates don't change frequently
    staleTime: 60 * 60 * 1000,
    // Retry up to 3 times
    retry: 3,
  });

  const formatAmount = (amount: number) => {
    const currency = preference?.currency_preference || 'USD';
    const rate = exchangeRates?.rates[currency as keyof typeof exchangeRates.rates] || 1;
    const convertedAmount = amount * rate;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(convertedAmount);
  };

  return {
    formatAmount,
    currency: preference?.currency_preference || 'USD',
    isLoading: !exchangeRates
  };
}