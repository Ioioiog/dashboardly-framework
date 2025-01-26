export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  read: boolean;
  sender: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}