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

interface Currency {
  code: string;
  name: string;
}

const availableCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'RON', name: 'Romanian Leu' }
];

const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates['rates']): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // All rates are in RON from BNR, so we need to:
  // 1. Convert the amount to RON first (if not already in RON)
  // 2. Then convert from RON to target currency
  
  let amountInRON = amount;
  if (fromCurrency !== 'RON') {
    amountInRON = amount * rates[fromCurrency as keyof typeof rates];
  }

  if (toCurrency === 'RON') {
    return amountInRON;
  }

  return amountInRON / rates[toCurrency as keyof typeof rates];
};

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

  // Fetch exchange rates with 24-hour caching
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
            USD: 4.56,
            EUR: 4.97,
            RON: 1
          }
        };
      }

      console.log('Received exchange rates:', rates);
      return { rates };
    },
    // Cache for 24 hours since rates don't change frequently
    staleTime: 24 * 60 * 60 * 1000,
    // Keep cached data for 24 hours (renamed from cacheTime)
    gcTime: 24 * 60 * 60 * 1000,
    // Retry up to 3 times
    retry: 3,
  });

  const formatAmount = (amount: number, fromCurrency: string = 'USD') => {
    const targetCurrency = preference?.currency_preference || 'USD';
    const rates = exchangeRates?.rates;

    if (!rates) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: targetCurrency,
      }).format(amount);
    }

    const convertedAmount = convertCurrency(amount, fromCurrency, targetCurrency, rates);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
    }).format(convertedAmount);
  };

  return {
    formatAmount,
    currency: preference?.currency_preference || 'USD',
    isLoading: !exchangeRates,
    availableCurrencies
  };
}