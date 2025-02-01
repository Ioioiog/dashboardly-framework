import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSpecificForm } from "@/components/auth/RoleSpecificForm";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { FloatingIconsLayout } from "@/components/auth/FloatingIconsLayout";
import { AuthCard } from "@/components/auth/AuthCard";

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
          console.log("Active session found, redirecting to index");
          navigate("/", { replace: true });
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
    setView("login");
    toast({
      title: "Welcome!",
      description: `Please sign in or create an account as a ${role.replace('_', ' ')}.`,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password
    });

    if (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
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
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0EA5E9]/5 via-transparent to-[#1EAEDB]/5">
        <FloatingIconsLayout variant="role-form" />
        <AuthBackground />
        <Card className="w-full max-w-md bg-transparent backdrop-blur-[2px] relative z-10 border-white/5">
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0EA5E9]/5 via-transparent to-[#1EAEDB]/5">
      <FloatingIconsLayout variant="auth-form" />
      <AuthBackground />
      <AuthCard
        view={view}
        userEmail={userEmail}
        password={password}
        onEmailChange={(e) => setUserEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onSubmit={handleSubmit}
        onViewChange={setView}
        onRoleSelect={handleRoleSelect}
      />
    </div>
  );
};

export default AuthPage;