import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { PasswordStrength } from "./PasswordStrength";

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
        <CardTitle className="text-2xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          {view === "login" ? "Login" : view === "register" ? "Create Account" : "Reset Password"}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {view === "forgot-password" &&
            "Enter your email address and we'll send you instructions to reset your password."}
        </CardDescription>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={userEmail}
            onChange={onEmailChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800/50"
          />
        </div>

        {view !== "forgot-password" && (
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder={view === "login" ? "Enter your password" : "Create password"}
              value={password}
              onChange={onPasswordChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800/50"
            />
            {view === "register" && <PasswordStrength password={password} />}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          {view === "login" ? "Login" : view === "register" ? "Register" : "Reset Password"}
        </Button>
      </form>

      <div className="flex flex-col space-y-2 text-center text-sm mt-6">
        {view === "login" && (
          <>
            <button
              onClick={() => onViewChange("forgot-password")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => onViewChange("register")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Don't have an account? Register
            </button>
          </>
        )}
        {(view === "register" || view === "forgot-password") && (
          <button
            onClick={() => onViewChange("login")}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Back to Login
          </button>
        )}
        <button
          onClick={() => onViewChange("roles")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          ← Back to Role Selection
        </button>
      </div>
    </div>
  );
}