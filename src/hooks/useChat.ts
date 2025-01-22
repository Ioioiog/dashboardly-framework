import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useChat(selectedTenantId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let messageSubscription: any = null;

    const setupChat = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          handleAuthError();
          return;
        }

        if (mounted) {
          console.log("Setting up conversation for user:", session.user.id);
          setCurrentUserId(session.user.id);
        }

        if (selectedTenantId) {
          const subscription = supabase
            .channel('messages')
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
            }, (payload) => {
              if (mounted) {
                setMessages(prev => [...prev, payload.new]);
              }
            })
            .subscribe();

          messageSubscription = subscription;
        }
      } catch (error) {
        console.error("Error setting up chat:", error);
        handleAuthError();
      }
    };

    const handleAuthError = () => {
      setCurrentUserId(null);
      toast({
        title: "Authentication Error",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      navigate('/auth');
    };

    setupChat();

    return () => {
      mounted = false;
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
    };
  }, [selectedTenantId, toast, navigate]);

  const sendMessage = async (content: string) => {
    try {
      if (!currentUserId || !selectedTenantId || !content.trim()) {
        return;
      }

      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        content: content.trim(),
        conversation_id: selectedTenantId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { messages, currentUserId, sendMessage };
}