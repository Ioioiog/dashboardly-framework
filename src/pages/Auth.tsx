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
  Shield, Globe, Mail, Wallet, Users, Home2
} from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-600/40 to-blue-700/40">
          <div className="absolute inset-0">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-600/40 to-blue-700/40">
        <div className="absolute inset-0">
          {/* Blob animations */}
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          {/* Floating icons - Primary layer */}
          <FloatingIcon icon={Home} className="top-1/4 left-1/4 animate-float-1" />
          <FloatingIcon icon={Building2} className="top-1/3 right-1/4 animate-float-2" />
          <FloatingIcon icon={Wrench} className="bottom-1/4 left-1/3 animate-float-3" />
          <FloatingIcon icon={MessageSquare} className="top-1/2 right-1/3 animate-float-4" />
          <FloatingIcon icon={FileText} className="bottom-1/3 right-1/4 animate-float-5" />
          <FloatingIcon icon={Settings} className="top-1/4 right-1/2 animate-float-6" />
          <FloatingIcon icon={Receipt} className="bottom-1/4 right-1/3 animate-float-7" />
          <FloatingIcon icon={Bell} className="top-1/3 left-1/3 animate-float-8" />
          <FloatingIcon icon={Calendar} className="bottom-1/3 left-1/4 animate-float-9" />
          <FloatingIcon icon={CreditCard} className="top-1/2 left-1/2 animate-float-10" />

          {/* Additional floating icons - Secondary layer */}
          <FloatingIcon icon={User} className="top-1/6 left-1/6 animate-float-1" />
          <FloatingIcon icon={Lock} className="bottom-1/6 right-1/6 animate-float-2" />
          <FloatingIcon icon={Key} className="top-2/3 left-1/5 animate-float-3" />
          <FloatingIcon icon={Shield} className="bottom-2/3 right-1/5 animate-float-4" />
          <FloatingIcon icon={Globe} className="top-1/3 left-2/3 animate-float-5" />
          <FloatingIcon icon={Mail} className="bottom-1/3 right-2/3 animate-float-6" />
          <FloatingIcon icon={Wallet} className="top-2/5 left-3/4 animate-float-7" />
          <FloatingIcon icon={Users} className="bottom-2/5 right-3/4 animate-float-8" />
          <FloatingIcon icon={Home2} className="top-3/4 left-1/3 animate-float-9" />
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