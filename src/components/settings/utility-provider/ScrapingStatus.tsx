import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ScrapingStatusProps {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastRunAt?: string | null;
  errorMessage?: string | null;
  onScrape: () => void;
  isLoading: boolean;
}

export function ScrapingStatus({ 
  status, 
  lastRunAt, 
  errorMessage, 
  onScrape,
  isLoading 
}: ScrapingStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={getStatusColor()}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      {lastRunAt && (
        <span className="text-sm text-muted-foreground">
          Last run: {new Date(lastRunAt).toLocaleString()}
        </span>
      )}
      {errorMessage && (
        <span className="text-sm text-red-500">
          Error: {errorMessage}
        </span>
      )}
      <Button
        size="sm"
        onClick={onScrape}
        disabled={isLoading || status === 'in_progress'}
      >
        {isLoading || status === 'in_progress' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scraping...
          </>
        ) : (
          'Scrape Now'
        )}
      </Button>
    </div>
  );
}