export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  read: boolean;
  conversation_id?: string | null;
  sender: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}