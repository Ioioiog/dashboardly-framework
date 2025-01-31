import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Wrench } from "lucide-react";
import { RoleSpecificForm } from "@/components/auth/RoleSpecificForm";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("tenant");
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"roles" | "login" | "register" | "forgot-password">("roles");

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "Session Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (session) {
          console.log("Active session found, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
        toast({
          title: "Unexpected Error",
          description: "An error occurred while checking your session",
          variant: "destructive",
        });
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setView("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: userEmail,
      password,
    });

    if (error) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "Check your email for confirmation.",
      });
      setView("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail);

    if (error) {
      toast({
        title: "Reset Password Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setView("login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background with modern gradient and animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 animate-gradient">
        {/* Shiny effect elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-xl relative z-10 transition-all duration-300 hover:shadow-blue-500/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/ee7b7c5d-7f56-451d-800e-19c3beac7ebd.png" 
              alt="AdminChirii Logo" 
              className="h-12"
            />
          </div>
          
          {view === "roles" && (
            <>
              <CardTitle className="text-2xl font-bold text-gray-800">Choose Your Role</CardTitle>
              <CardDescription className="text-gray-600">Select your role to continue</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {view === "roles" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleRoleSelect("tenant")}
                className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
              >
                <Home className="w-8 h-8 mb-2 text-blue-500" />
                <span className="font-medium">Tenant</span>
              </button>
              
              <button
                onClick={() => handleRoleSelect("landlord")}
                className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
              >
                <Building2 className="w-8 h-8 mb-2 text-blue-500" />
                <span className="font-medium">Landlord</span>
              </button>
              
              <button
                onClick={() => handleRoleSelect("service_provider")}
                className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
              >
                <Wrench className="w-8 h-8 mb-2 text-blue-500" />
                <span className="font-medium">Service Provider</span>
              </button>
            </div>
          )}

          {view !== "roles" && (
            <div className="space-y-6">
              <div className="text-center">
                <CardTitle className="text-2xl mb-2">
                  {view === "login" ? "Login" : view === "register" ? "Create Account" : "Reset Password"}
                </CardTitle>
                <CardDescription>
                  {view === "forgot-password" && "Enter your email address and we'll send you instructions to reset your password."}
                </CardDescription>
              </div>

              <form onSubmit={view === "login" ? handleLogin : view === "register" ? handleRegister : handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>

                {view !== "forgot-password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={view === "login" ? "Enter your password" : "Create password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {view === "register" && <PasswordStrength password={password} />}
                  </div>
                )}

                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                  {view === "login" ? "Login" : view === "register" ? "Register" : "Reset Password"}
                </Button>
              </form>

              <div className="flex flex-col space-y-2 text-center text-sm">
                {view === "login" && (
                  <>
                    <button onClick={() => setView("forgot-password")} className="text-blue-500 hover:underline">
                      Forgot Password?
                    </button>
                    <button onClick={() => setView("register")} className="text-blue-500 hover:underline">
                      Don't have an account? Register
                    </button>
                  </>
                )}
                {(view === "register" || view === "forgot-password") && (
                  <button onClick={() => setView("login")} className="text-blue-500 hover:underline">
                    Back to Login
                  </button>
                )}
                <button onClick={() => setView("roles")} className="text-gray-500 hover:underline">
                  ← Back to Role Selection
                </button>
              </div>
            </div>
          )}

          {showRoleForm && (
            <RoleSpecificForm
              role={selectedRole}
              email={userEmail}
              onComplete={() => navigate("/dashboard")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;