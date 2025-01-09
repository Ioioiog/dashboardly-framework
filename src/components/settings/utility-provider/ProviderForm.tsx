import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProviderFormData {
  provider_name: string;
  username: string;
  password: string;
}

interface ProviderFormProps {
  data: ProviderFormData;
  onChange: (data: ProviderFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ProviderForm({ data, onChange, onSubmit, isLoading }: ProviderFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provider_name">Provider Name</Label>
        <Input
          id="provider_name"
          value={data.provider_name}
          onChange={(e) =>
            onChange({ ...data, provider_name: e.target.value })
          }
          disabled={isLoading}
          required
          placeholder="e.g., Electric Company"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={data.username}
          onChange={(e) =>
            onChange({ ...data, username: e.target.value })
          }
          disabled={isLoading}
          required
          placeholder="Enter your username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) =>
            onChange({ ...data, password: e.target.value })
          }
          disabled={isLoading}
          required
          placeholder="Enter your password"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding Provider..." : "Add Provider"}
      </Button>
    </form>
  );
}