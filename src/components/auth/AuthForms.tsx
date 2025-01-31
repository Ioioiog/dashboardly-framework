import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { PasswordStrength } from "./PasswordStrength";
import { Mail, Lock, ArrowLeft } from "lucide-react";

interface AuthFormsProps {
  view: "login" | "register" | "forgot-password";
  userEmail: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onViewChange: (view: "login" | "register" | "forgot-password" | "roles") => void;
}

export function AuthForms({
  view,
  userEmail,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onViewChange,
}: AuthFormsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CardTitle className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 animate-fade-in">
          {view === "login" ? "Welcome Back" : view === "register" ? "Create Account" : "Reset Password"}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 animate-fade-in">
          {view === "login" 
            ? "Sign in to your account to continue" 
            : view === "register" 
            ? "Fill in your details to get started"
            : "Enter your email address and we'll send you instructions to reset your password."}
        </CardDescription>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 animate-fade-in">
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="email"
              placeholder="Email address"
              value={userEmail}
              onChange={onEmailChange}
              required
              className="pl-10 h-12 bg-gray-50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg"
            />
          </div>

          {view !== "forgot-password" && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={onPasswordChange}
                  required
                  className="pl-10 h-12 bg-gray-50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg"
                />
              </div>
              {view === "register" && <PasswordStrength password={password} />}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          {view === "login" ? "Sign In" : view === "register" ? "Create Account" : "Send Reset Link"}
        </Button>
      </form>

      <div className="flex flex-col space-y-3 text-center text-sm mt-6 animate-fade-in">
        {view === "login" && (
          <>
            <button
              onClick={() => onViewChange("forgot-password")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => onViewChange("register")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
            >
              Don't have an account? Create one
            </button>
          </>
        )}
        {(view === "register" || view === "forgot-password") && (
          <button
            onClick={() => onViewChange("login")}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
          >
            Back to Login
          </button>
        )}
        <button
          onClick={() => onViewChange("roles")}
          className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors gap-1 font-medium group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Role Selection
        </button>
      </div>
    </div>
  );
}