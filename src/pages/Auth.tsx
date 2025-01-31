import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { AuthForms } from "@/components/auth/AuthForms";
import { RoleSpecificForm } from "@/components/auth/RoleSpecificForm";

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
    console.log("Selected role:", role);
    setSelectedRole(role);
    setView("register");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (error) {
      console.error("Login error:", error);
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
    console.log("Starting registration process with role:", selectedRole);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: {
            role: selectedRole,
          },
        },
      });

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Registration successful:", data);
      
      if (selectedRole === 'service_provider') {
        setShowRoleForm(true);
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email for confirmation.",
        });
        setView("login");
      }
    } catch (error) {
      console.error("Unexpected registration error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive",
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    if (view === "login") return handleLogin(e);
    if (view === "register") return handleRegister(e);
    return handleForgotPassword(e);
  };

  const handleRoleFormComplete = () => {
    setShowRoleForm(false);
    setView("login");
    toast({
      title: "Profile Updated",
      description: "Your service provider profile has been created.",
    });
  };

  if (showRoleForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 animate-gradient">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </div>
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm relative z-10">
          <CardContent className="p-6">
            <RoleSpecificForm
              role={selectedRole}
              email={userEmail}
              onComplete={handleRoleFormComplete}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 animate-gradient">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm relative z-10 transition-all duration-300 hover:shadow-blue-500/20 border-0 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-slate-900/90 dark:text-white">
        <CardContent className="space-y-6 px-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/ee7b7c5d-7f56-451d-800e-19c3beac7ebd.png" 
              alt="AdminChirii Logo" 
              className="h-20 drop-shadow-md"
            />
          </div>

          {view === "roles" ? (
            <RoleSelection onRoleSelect={handleRoleSelect} />
          ) : (
            <AuthForms
              view={view}
              userEmail={userEmail}
              password={password}
              onEmailChange={(e) => setUserEmail(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              onSubmit={handleSubmit}
              onViewChange={setView}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;