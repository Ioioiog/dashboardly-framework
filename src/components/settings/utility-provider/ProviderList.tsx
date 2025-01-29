import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrapingStatus } from "./ScrapingStatus";
import { Edit2, Trash2 } from "lucide-react";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
  property_id?: string;
  property?: {
    name: string;
    address: string;
  };
  utility_type?: 'electricity' | 'water' | 'gas';
  start_day?: number;
  end_day?: number;
}

interface ScrapingJob {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  last_run_at: string | null;
  error_message: string | null;
}

interface ProviderListProps {
  providers: UtilityProvider[];
  onDelete: (id: string) => void;
  onEdit: (provider: UtilityProvider) => void;
  isLoading: boolean;
}

export function ProviderList({ providers, onDelete, onEdit, isLoading }: ProviderListProps) {
  const [scrapingStates, setScrapingStates] = useState<Record<string, boolean>>({});
  const [scrapingJobs, setScrapingJobs] = useState<Record<string, ScrapingJob>>({});
  const { toast } = useToast();

  const handleScrape = async (providerId: string) => {
    try {
      console.log('Starting scrape for provider:', providerId);
      setScrapingStates(prev => ({ ...prev, [providerId]: true }));

      // Create or update scraping job
      const { error: jobError } = await supabase
        .from('scraping_jobs')
        .upsert({
          utility_provider_id: providerId,
          status: 'pending',
          last_run_at: new Date().toISOString()
        });

      if (jobError) {
        console.error('Error creating scraping job:', jobError);
        throw jobError;
      }

      // Call the edge function to start scraping
      const { error } = await supabase.functions.invoke('scrape-utility-invoices', {
        body: { providerId }
      });

      if (error) {
        console.error('Error invoking edge function:', error);
        throw error;
      }

      // Start polling for status updates
      const interval = setInterval(async () => {
        const { data: jobs, error: pollError } = await supabase
          .from('scraping_jobs')
          .select('status, last_run_at, error_message')
          .eq('utility_provider_id', providerId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (pollError) {
          console.error('Polling error:', pollError);
          return;
        }

        if (jobs && jobs.length > 0) {
          const latestJob = jobs[0];
          console.log('Latest job status:', latestJob);
          setScrapingJobs(prev => ({ ...prev, [providerId]: latestJob }));
          
          if (latestJob.status === 'completed' || latestJob.status === 'failed') {
            clearInterval(interval);
            setScrapingStates(prev => ({ ...prev, [providerId]: false }));
            
            toast({
              title: latestJob.status === 'completed' ? 'Success' : 'Error',
              description: latestJob.status === 'completed' 
                ? 'Utility invoices scraped successfully'
                : `Failed to scrape invoices: ${latestJob.error_message}`,
              variant: latestJob.status === 'completed' ? 'default' : 'destructive',
            });
          }
        }
      }, 2000);

      // Cleanup interval after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (scrapingStates[providerId]) {
          setScrapingStates(prev => ({ ...prev, [providerId]: false }));
          toast({
            title: 'Warning',
            description: 'Scraping job timed out. Please check the status later.',
            variant: 'destructive',
          });
        }
      }, 300000);

    } catch (error: any) {
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
              {provider.utility_type && (
                <p className="text-sm text-muted-foreground capitalize">
                  Type: {provider.utility_type}
                </p>
              )}
              {provider.property && (
                <p className="text-sm text-muted-foreground">
                  Property: {provider.property.name} ({provider.property.address})
                </p>
              )}
              {provider.start_day && provider.end_day && (
                <p className="text-sm text-muted-foreground">
                  Reading Period: Day {provider.start_day} - {provider.end_day}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(provider)}
                disabled={isLoading || scrapingStates[provider.id]}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(provider.id)}
                disabled={isLoading || scrapingStates[provider.id]}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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