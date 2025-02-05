import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SignOutButtonProps {
  isExpanded: boolean;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ isExpanded }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    console.log("Starting sign out process...");
    
    try {
      // Clear all local storage items related to auth
      console.log("Clearing auth tokens...");
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Sign out from Supabase
      console.log("Calling Supabase signOut...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }

      console.log("Sign out successful");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });

      // Navigate to auth page
      navigate('/auth');
      
    } catch (error) {
      console.error("Error during sign out process:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isExpanded) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        onClick={handleSignOut}
        disabled={isLoading}
      >
        <LogOut className="mr-3 h-5 w-5" />
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-white dark:bg-gray-900 text-sm">
          {isLoading ? "Signing out..." : "Sign Out"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};