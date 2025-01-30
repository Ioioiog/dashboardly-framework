import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

export function useSettingsSync() {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up settings sync listener...');

    const channel = supabase.channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('Received settings update:', payload);
          const newSettings = payload.new.settings;
          
          // Update language if changed
          if (newSettings?.language && newSettings.language !== i18n.language) {
            console.log('Updating language to:', newSettings.language);
            localStorage.setItem('language', newSettings.language);
            i18n.changeLanguage(newSettings.language);
          }

          // Invalidate currency preference query to trigger refetch
          if (newSettings?.currency) {
            console.log('Invalidating currency preferences...');
            queryClient.invalidateQueries({ queryKey: ['currency-preference'] });
          }

          toast({
            title: "Settings Updated",
            description: "Your settings have been updated successfully",
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up settings sync listener...');
      supabase.removeChannel(channel);
    };
  }, [toast, i18n, queryClient]);
}