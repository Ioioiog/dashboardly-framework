import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrapingStatus } from "./ScrapingStatus";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
}

interface ScrapingJob {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  last_run_at: string | null;
  error_message: string | null;
}

interface ProviderListProps {
  providers: UtilityProvider[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function ProviderList({ providers, onDelete, isLoading }: ProviderListProps) {
  const [scrapingStates, setScrapingStates] = useState<Record<string, boolean>>({});
  const [scrapingJobs, setScrapingJobs] = useState<Record<string, ScrapingJob>>({});
  const { toast } = useToast();

  const handleScrape = async (providerId: string) => {
    try {
      setScrapingStates(prev => ({ ...prev, [providerId]: true }));

      // Create or update scraping job
      const { error: jobError } = await supabase
        .from('scraping_jobs')
        .upsert({
          utility_provider_id: providerId,
          status: 'pending'
        });

      if (jobError) throw jobError;

      // Call the edge function to start scraping
      const { error } = await supabase.functions.invoke('scrape-utility-invoices', {
        body: { providerId }
      });

      if (error) throw error;

      // Start polling for status updates
      const interval = setInterval(async () => {
        const { data: job, error: pollError } = await supabase
          .from('scraping_jobs')
          .select('status, last_run_at, error_message')
          .eq('utility_provider_id', providerId)
          .single();

        if (pollError) {
          console.error('Polling error:', pollError);
          return;
        }

        if (job) {
          setScrapingJobs(prev => ({ ...prev, [providerId]: job }));
          
          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(interval);
            setScrapingStates(prev => ({ ...prev, [providerId]: false }));
            
            toast({
              title: job.status === 'completed' ? 'Success' : 'Error',
              description: job.status === 'completed' 
                ? 'Utility invoices scraped successfully'
                : `Failed to scrape invoices: ${job.error_message}`,
              variant: job.status === 'completed' ? 'default' : 'destructive',
            });
          }
        }
      }, 2000);

      // Cleanup interval after 5 minutes
      setTimeout(() => clearInterval(interval), 300000);

    } catch (error) {
      console.error('Scraping error:', error);
      setScrapingStates(prev => ({ ...prev, [providerId]: false }));
      toast({
        title: 'Error',
        description: 'Failed to start scraping process',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className="flex flex-col space-y-2 p-4 border rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{provider.provider_name}</p>
              <p className="text-sm text-muted-foreground">
                Username: {provider.username}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(provider.id)}
              disabled={isLoading || scrapingStates[provider.id]}
            >
              Remove
            </Button>
          </div>
          
          <ScrapingStatus
            status={scrapingJobs[provider.id]?.status || 'pending'}
            lastRunAt={scrapingJobs[provider.id]?.last_run_at}
            errorMessage={scrapingJobs[provider.id]?.error_message}
            onScrape={() => handleScrape(provider.id)}
            isLoading={scrapingStates[provider.id] || false}
          />
        </div>
      ))}
    </div>
  );
}