import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { AuthForms } from "@/components/auth/AuthForms";

interface AuthCardProps {
  view: "roles" | "login" | "register" | "forgot-password";
  userEmail: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onViewChange: (view: "login" | "register" | "forgot-password" | "roles") => void;
  onRoleSelect: (role: string) => void;
}

export function AuthCard({
  view,
  userEmail,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onViewChange,
  onRoleSelect,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md bg-transparent backdrop-blur-[2px] relative z-10 border-white/5">
      <CardContent className="space-y-6 px-8">
        <div className="flex items-center justify-center mb-6 bg-transparent">
          <img 
            src="/lovable-uploads/dcfa5555-90d2-43ca-9aad-65f0a8c8f211.png" 
            alt="AdminChirii Logo" 
            className="h-20 drop-shadow-md"
          />
        </div>

        {view === "roles" ? (
          <RoleSelection onRoleSelect={onRoleSelect} />
        ) : (
          <AuthForms
            view={view}
            userEmail={userEmail}
            password={password}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onSubmit={onSubmit}
            onViewChange={onViewChange}
          />
        )}
      </CardContent>
    </Card>
  );
}