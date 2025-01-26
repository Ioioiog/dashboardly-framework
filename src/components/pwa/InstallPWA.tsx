import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Install prompt captured');
    };

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      toast({
        title: navigator.onLine ? "You're back online!" : "You're offline",
        description: navigator.onLine 
          ? "App is now syncing with the server" 
          : "Don't worry, you can still use the app",
        variant: navigator.onLine ? "default" : "destructive",
      });
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('PWA was installed');
      toast({
        title: "Success",
        description: "App installed successfully!",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker is active');
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        toast({
          title: "Success",
          description: "App installed successfully!",
        });
      } else {
        console.log('User dismissed the install prompt');
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
      className="fixed bottom-4 right-4 z-50 shadow-lg"
    >
      Install App
    </Button>
  );
}