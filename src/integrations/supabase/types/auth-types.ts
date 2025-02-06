export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface AuthSchema {
  Tables: {
    profiles: {
      Row: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        role: string;
        created_at: string;
        updated_at: string;
        email: string | null;
        phone: string | null;
        stripe_account_id: string | null;
        invoice_info: Json | null;
        currency_preference: string | null;
        settings: Json | null;
        subscription_plan: 'free' | 'basic' | 'premium' | 'gold';
        subscription_start_date: string | null;
        subscription_end_date: string | null;
        notification_preferences: Json | null;
      };
      Insert: {
        id: string;
        first_name?: string | null;
        last_name?: string | null;
        role?: string;
        created_at?: string;
        updated_at?: string;
        email?: string | null;
        phone?: string | null;
        stripe_account_id?: string | null;
        invoice_info?: Json | null;
        currency_preference?: string | null;
        settings?: Json | null;
        subscription_plan?: 'free' | 'basic' | 'premium' | 'gold';
        subscription_start_date?: string | null;
        subscription_end_date?: string | null;
        notification_preferences?: Json | null;
      };
      Update: {
        id?: string;
        first_name?: string | null;
        last_name?: string | null;
        role?: string;
        created_at?: string;
        updated_at?: string;
        email?: string | null;
        phone?: string | null;
        stripe_account_id?: string | null;
        invoice_info?: Json | null;
        currency_preference?: string | null;
        settings?: Json | null;
        subscription_plan?: 'free' | 'basic' | 'premium' | 'gold';
        subscription_start_date?: string | null;
        subscription_end_date?: string | null;
        notification_preferences?: Json | null;
      };
    };
  };
}