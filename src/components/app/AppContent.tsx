import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuthState } from "@/hooks/useAuthState"
import { AppRoutes } from "@/components/routing/AppRoutes"

export const AppContent = () => {
  const { isLoading, isAuthenticated } = useAuthState();

  console.log("App rendering state:", { isLoading, isAuthenticated });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-auto">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes isAuthenticated={isAuthenticated} />
      </TooltipProvider>
    </div>
  );
};