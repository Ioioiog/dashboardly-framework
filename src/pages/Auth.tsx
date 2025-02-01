import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { AuthForms } from "@/components/auth/AuthForms";
import { RoleSpecificForm } from "@/components/auth/RoleSpecificForm";
import { 
  Home, Building2, Wrench, MessageSquare, FileText, Settings, 
  Receipt, Bell, Calendar, CreditCard, User, Lock, Key, 
  Shield, Globe, Mail, Wallet, Users, HomeIcon
} from "lucide-react";

// ... keep existing code (useState, useEffect, handlers)

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

  const FloatingIcon = ({ icon: Icon, className }: { icon: any, className: string }) => (
    <div className={`absolute opacity-[0.08] dark:opacity-[0.12] ${className}`}>
      <Icon size={48} />
    </div>
  );

  if (showRoleForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#1A1F2C]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-700/40">
          <div className="absolute inset-0">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm relative z-10">
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#1A1F2C]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-700/40">
        <div className="absolute inset-0">
          {/* Blob animations */}
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          {/* Primary Layer - Top Section */}
          <FloatingIcon icon={Home} className="top-[10%] left-[15%] animate-float-1" />
          <FloatingIcon icon={Building2} className="top-[15%] right-[20%] animate-float-2" />
          <FloatingIcon icon={Wrench} className="top-[20%] left-[25%] animate-float-3" />
          <FloatingIcon icon={MessageSquare} className="top-[25%] right-[30%] animate-float-4" />
          <FloatingIcon icon={FileText} className="top-[30%] left-[35%] animate-float-5" />

          {/* Primary Layer - Middle Section */}
          <FloatingIcon icon={Settings} className="top-[40%] right-[40%] animate-float-6" />
          <FloatingIcon icon={Receipt} className="top-[45%] left-[45%] animate-float-7" />
          <FloatingIcon icon={Bell} className="top-[50%] right-[50%] animate-float-8" />
          <FloatingIcon icon={Calendar} className="top-[55%] left-[55%] animate-float-9" />
          <FloatingIcon icon={CreditCard} className="top-[60%] right-[60%] animate-float-10" />

          {/* Secondary Layer - Top Section */}
          <FloatingIcon icon={User} className="bottom-[70%] left-[10%] animate-float-1" />
          <FloatingIcon icon={Lock} className="bottom-[75%] right-[15%] animate-float-2" />
          <FloatingIcon icon={Key} className="bottom-[80%] left-[20%] animate-float-3" />
          <FloatingIcon icon={Shield} className="bottom-[85%] right-[25%] animate-float-4" />
          <FloatingIcon icon={Globe} className="bottom-[90%] left-[30%] animate-float-5" />

          {/* Secondary Layer - Bottom Section */}
          <FloatingIcon icon={Mail} className="bottom-[20%] right-[35%] animate-float-6" />
          <FloatingIcon icon={Wallet} className="bottom-[25%] left-[40%] animate-float-7" />
          <FloatingIcon icon={Users} className="bottom-[30%] right-[45%] animate-float-8" />
          <FloatingIcon icon={HomeIcon} className="bottom-[35%] left-[50%] animate-float-9" />

          {/* Additional Icons for Fuller Coverage */}
          <FloatingIcon icon={Building2} className="top-[70%] left-[60%] animate-float-1" />
          <FloatingIcon icon={MessageSquare} className="top-[75%] right-[65%] animate-float-2" />
          <FloatingIcon icon={Settings} className="top-[80%] left-[70%] animate-float-3" />
          <FloatingIcon icon={Bell} className="top-[85%] right-[75%] animate-float-4" />
          <FloatingIcon icon={User} className="top-[90%] left-[80%] animate-float-5" />
        </div>
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm relative z-10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 border-0">
        <CardContent className="space-y-6 px-8">
          <div className="flex items-center justify-center mb-6 bg-transparent">
            <img 
              src="/lovable-uploads/ee7b7c5d-7f56-451d-800e-19c3beac7ebd.png" 
              alt="AdminChirii Logo" 
              className="h-20 drop-shadow-md mix-blend-multiply"
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