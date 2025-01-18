import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProviderFormProps {
  data: {
    provider_name: string;
    username: string;
    password: string;
  };
  onChange: (data: any) => void;
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
          onChange={(e) => onChange({ ...data, provider_name: e.target.value })}
          placeholder="Enter provider name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={data.username}
          onChange={(e) => onChange({ ...data, username: e.target.value })}
          placeholder="Enter username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => onChange({ ...data, password: e.target.value })}
          placeholder="Enter password"
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-400 text-white"
      >
        {isLoading ? "Adding..." : "Add Provider"}
      </Button>
    </form>
  );
}
