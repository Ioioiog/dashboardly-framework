import { Button } from "@/components/ui/button";

interface UtilityProvider {
  id: string;
  provider_name: string;
  username: string;
}

interface ProviderListProps {
  providers: UtilityProvider[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function ProviderList({ providers, onDelete, isLoading }: ProviderListProps) {
  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
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
            disabled={isLoading}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}