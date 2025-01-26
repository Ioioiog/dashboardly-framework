import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Success",
          description: "App installed successfully!",
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast({
        title: "Error",
        description: "Failed to install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!deferredPrompt) return null;

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      className="fixed bottom-4 right-4 z-50"
    >
      Install App
    </Button>
  );
}