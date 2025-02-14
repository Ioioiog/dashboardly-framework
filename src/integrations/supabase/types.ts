export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          landlord_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landlord_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landlord_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_path: string
          id: string
          name: string
          property_id: string | null
          tenant_id: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_path: string
          id?: string
          name: string
          property_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_path?: string
          id?: string
          name?: string
          property_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          id: string
          landlord_id: string
          paid_at: string | null
          property_id: string
          status: Database["public"]["Enums"]["invoice_status"] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          landlord_id: string
          paid_at?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          landlord_id?: string
          paid_at?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      landlord_service_providers: {
        Row: {
          created_at: string
          id: string
          is_preferred: boolean | null
          landlord_id: string
          service_provider_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_preferred?: boolean | null
          landlord_id: string
          service_provider_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_preferred?: boolean | null
          landlord_id?: string
          service_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlord_service_providers_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landlord_service_providers_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "landlord_service_providers_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          created_at: string
          customer_id: string | null
          description: string | null
          id: string
          materials_cost: number
          service_provider_fee: number
          service_provider_id: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          materials_cost?: number
          service_provider_fee?: number
          service_provider_id?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          materials_cost?: number
          service_provider_fee?: number
          service_provider_id?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          recipient_id: string | null
          request_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          recipient_id?: string | null
          request_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          recipient_id?: string | null
          request_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "maintenance_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_request_chats: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          receiver_id: string | null
          request_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          receiver_id?: string | null
          request_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          receiver_id?: string | null
          request_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_request_chats_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_request_chats_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "maintenance_request_chats_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_request_chats_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_request_chats_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      maintenance_request_history: {
        Row: {
          description: string
          edited_at: string
          edited_by: string
          id: string
          images: string[] | null
          issue_type: string | null
          maintenance_request_id: string
          notes: string | null
          priority: string | null
          title: string
        }
        Insert: {
          description: string
          edited_at?: string
          edited_by: string
          id?: string
          images?: string[] | null
          issue_type?: string | null
          maintenance_request_id: string
          notes?: string | null
          priority?: string | null
          title: string
        }
        Update: {
          description?: string
          edited_at?: string
          edited_by?: string
          id?: string
          images?: string[] | null
          issue_type?: string | null
          maintenance_request_id?: string
          notes?: string | null
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_request_history_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_request_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          request_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_request_ratings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_request_ratings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_request_ratings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          approval_notes: string | null
          approval_status: string | null
          assigned_to: string | null
          completion_date: string | null
          completion_report: string | null
          contact_phone: string | null
          cost_estimate: number | null
          cost_estimate_notes: string | null
          cost_estimate_status: string | null
          created_at: string
          description: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_instructions: string | null
          id: string
          images: string[] | null
          is_emergency: boolean | null
          issue_type: string | null
          materials_cost: number | null
          next_scheduled_date: string | null
          notes: string | null
          notification_preferences: Json | null
          payment_amount: number | null
          payment_status: string | null
          preferred_times: string[] | null
          priority:
            | Database["public"]["Enums"]["maintenance_request_priority"]
            | null
          property_id: string
          rating: number | null
          rating_comment: string | null
          read_by_landlord: boolean | null
          read_by_tenant: boolean | null
          recurring_schedule: Json | null
          scheduled_date: string | null
          service_provider_fee: number | null
          service_provider_notes: string | null
          service_provider_status: string | null
          status: Database["public"]["Enums"]["maintenance_request_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string | null
          assigned_to?: string | null
          completion_date?: string | null
          completion_report?: string | null
          contact_phone?: string | null
          cost_estimate?: number | null
          cost_estimate_notes?: string | null
          cost_estimate_status?: string | null
          created_at?: string
          description: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_instructions?: string | null
          id?: string
          images?: string[] | null
          is_emergency?: boolean | null
          issue_type?: string | null
          materials_cost?: number | null
          next_scheduled_date?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          payment_amount?: number | null
          payment_status?: string | null
          preferred_times?: string[] | null
          priority?:
            | Database["public"]["Enums"]["maintenance_request_priority"]
            | null
          property_id: string
          rating?: number | null
          rating_comment?: string | null
          read_by_landlord?: boolean | null
          read_by_tenant?: boolean | null
          recurring_schedule?: Json | null
          scheduled_date?: string | null
          service_provider_fee?: number | null
          service_provider_notes?: string | null
          service_provider_status?: string | null
          status?: Database["public"]["Enums"]["maintenance_request_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string | null
          assigned_to?: string | null
          completion_date?: string | null
          completion_report?: string | null
          contact_phone?: string | null
          cost_estimate?: number | null
          cost_estimate_notes?: string | null
          cost_estimate_status?: string | null
          created_at?: string
          description?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_instructions?: string | null
          id?: string
          images?: string[] | null
          is_emergency?: boolean | null
          issue_type?: string | null
          materials_cost?: number | null
          next_scheduled_date?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          payment_amount?: number | null
          payment_status?: string | null
          preferred_times?: string[] | null
          priority?:
            | Database["public"]["Enums"]["maintenance_request_priority"]
            | null
          property_id?: string
          rating?: number | null
          rating_comment?: string | null
          read_by_landlord?: boolean | null
          read_by_tenant?: boolean | null
          recurring_schedule?: Json | null
          scheduled_date?: string | null
          service_provider_fee?: number | null
          service_provider_notes?: string | null
          service_provider_status?: string | null
          status?: Database["public"]["Enums"]["maintenance_request_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          profile_id: string
          read: boolean | null
          receiver_id: string | null
          room_id: string | null
          sender_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          profile_id: string
          read?: boolean | null
          receiver_id?: string | null
          room_id?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          read?: boolean | null
          receiver_id?: string | null
          room_id?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_readings: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          property_id: string
          reading_date: string
          reading_type: Database["public"]["Enums"]["meter_type"]
          reading_value: number
          tenant_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          property_id: string
          reading_date?: string
          reading_type: Database["public"]["Enums"]["meter_type"]
          reading_value: number
          tenant_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          property_id?: string
          reading_date?: string
          reading_type?: Database["public"]["Enums"]["meter_type"]
          reading_value?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "meter_readings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "meter_readings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "meter_readings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          id: string
          paid_date: string | null
          read_by_landlord: boolean | null
          read_by_tenant: boolean | null
          status: string
          tenancy_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          paid_date?: string | null
          read_by_landlord?: boolean | null
          read_by_tenant?: boolean | null
          status?: string
          tenancy_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          read_by_landlord?: boolean | null
          read_by_tenant?: boolean | null
          status?: string
          tenancy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenancy_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          currency_preference: string | null
          email: string | null
          first_name: string | null
          id: string
          invoice_info: Json | null
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          role: string
          settings: Json | null
          stripe_account_id: string | null
          subscription_end_date: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          subscription_start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_preference?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          invoice_info?: Json | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          settings?: Json | null
          stripe_account_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_preference?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          invoice_info?: Json | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          settings?: Json | null
          stripe_account_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          available_from: string | null
          created_at: string
          description: string | null
          id: string
          landlord_id: string
          monthly_rent: number
          name: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          address: string
          available_from?: string | null
          created_at?: string
          description?: string | null
          id?: string
          landlord_id: string
          monthly_rent: number
          name: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          available_from?: string | null
          created_at?: string
          description?: string | null
          id?: string
          landlord_id?: string
          monthly_rent?: number
          name?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_run_at: string | null
          status: Database["public"]["Enums"]["scraping_status"]
          updated_at: string
          utility_provider_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_run_at?: string | null
          status?: Database["public"]["Enums"]["scraping_status"]
          updated_at?: string
          utility_provider_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_run_at?: string | null
          status?: Database["public"]["Enums"]["scraping_status"]
          updated_at?: string
          utility_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraping_jobs_utility_provider_id_fkey"
            columns: ["utility_provider_id"]
            isOneToOne: false
            referencedRelation: "utility_provider_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_availability: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string | null
          id: string
          provider_id: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          provider_id?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          provider_id?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      service_provider_profiles: {
        Row: {
          availability_hours: Json | null
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_first_login: boolean | null
          profile_id: string | null
          rating: number | null
          review_count: number | null
          service_area: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          availability_hours?: Json | null
          business_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id: string
          is_first_login?: boolean | null
          profile_id?: string | null
          rating?: number | null
          review_count?: number | null
          service_area?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          availability_hours?: Json | null
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_first_login?: boolean | null
          profile_id?: string | null
          rating?: number | null
          review_count?: number | null
          service_area?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      service_provider_services: {
        Row: {
          base_price: number | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          price_unit: string | null
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          price_unit?: string | null
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          price_unit?: string | null
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          id: string
          name: Database["public"]["Enums"]["subscription_plan"]
          price: number
          tenant_limit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: Database["public"]["Enums"]["subscription_plan"]
          price: number
          tenant_limit: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          tenant_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      tenancies: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          monthly_pay_day: number | null
          property_id: string
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_pay_day?: number | null
          property_id: string
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_pay_day?: number | null
          property_id?: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenancies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "tenancies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["tenant_action_type"]
          created_at: string
          id: string
          landlord_id: string
          metadata: Json | null
          property_ids: string[]
          tenant_email: string | null
          tenant_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["tenant_action_type"]
          created_at?: string
          id?: string
          landlord_id: string
          metadata?: Json | null
          property_ids: string[]
          tenant_email?: string | null
          tenant_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["tenant_action_type"]
          created_at?: string
          id?: string
          landlord_id?: string
          metadata?: Json | null
          property_ids?: string[]
          tenant_email?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_audit_logs_landlord_fk"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_audit_logs_landlord_fk"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_audit_logs_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_audit_logs_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_invitation_properties: {
        Row: {
          invitation_id: string
          property_id: string
        }
        Insert: {
          invitation_id: string
          property_id: string
        }
        Update: {
          invitation_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitation_properties_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "tenant_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitation_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitation_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          created_at: string
          email: string
          end_date: string | null
          expiration_date: string
          first_name: string | null
          id: string
          last_name: string | null
          start_date: string
          status: string
          token: string
          updated_at: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          end_date?: string | null
          expiration_date?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          start_date: string
          status?: string
          token: string
          updated_at?: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          end_date?: string | null
          expiration_date?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          start_date?: string
          status?: string
          token?: string
          updated_at?: string
          used?: boolean
        }
        Relationships: []
      }
      tenant_observations: {
        Row: {
          created_at: string
          id: string
          landlord_id: string
          observation: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landlord_id: string
          observation: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landlord_id?: string
          observation?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_observations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_observations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_observations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_observations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      utilities: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          id: string
          property_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          property_id: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          property_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
        ]
      }
      utility_invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          invoice_number: string | null
          pdf_path: string | null
          status: string
          updated_at: string
          utility_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          invoice_number?: string | null
          pdf_path?: string | null
          status?: string
          updated_at?: string
          utility_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string | null
          pdf_path?: string | null
          status?: string
          updated_at?: string
          utility_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_invoices_utility_id_fkey"
            columns: ["utility_id"]
            isOneToOne: false
            referencedRelation: "utilities"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_provider_credentials: {
        Row: {
          created_at: string
          encrypted_password: string
          end_day: number | null
          id: string
          landlord_id: string
          location_name: string | null
          property_id: string | null
          provider_name: string
          start_day: number | null
          updated_at: string
          username: string
          utility_type:
            | Database["public"]["Enums"]["utility_reading_type"]
            | null
        }
        Insert: {
          created_at?: string
          encrypted_password: string
          end_day?: number | null
          id?: string
          landlord_id: string
          location_name?: string | null
          property_id?: string | null
          provider_name: string
          start_day?: number | null
          updated_at?: string
          username: string
          utility_type?:
            | Database["public"]["Enums"]["utility_reading_type"]
            | null
        }
        Update: {
          created_at?: string
          encrypted_password?: string
          end_day?: number | null
          id?: string
          landlord_id?: string
          location_name?: string | null
          property_id?: string | null
          provider_name?: string
          start_day?: number | null
          updated_at?: string
          username?: string
          utility_type?:
            | Database["public"]["Enums"]["utility_reading_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "utility_provider_credentials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_provider_credentials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "tenant_details"
            referencedColumns: ["property_id"]
          },
        ]
      }
    }
    Views: {
      tenant_details: {
        Row: {
          email: string | null
          end_date: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          property_address: string | null
          property_id: string | null
          property_name: string | null
          role: string | null
          start_date: string | null
          tenancy_id: string | null
          tenancy_status: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_tenant_invitation: {
        Args: {
          invitation_id: string
        }
        Returns: undefined
      }
      generate_monthly_invoices: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_latest_tenancy: {
        Args: {
          p_tenant_id: string
        }
        Returns: {
          tenancy_id: string
          status: string
          start_date: string
          end_date: string
          property_id: string
          property_name: string
          property_address: string
        }[]
      }
      get_property_utility_stats: {
        Args: {
          property_id: string
        }
        Returns: Json
      }
      set_claim: {
        Args: {
          params: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      document_type: "lease_agreement" | "invoice" | "receipt" | "other"
      invoice_status: "pending" | "paid" | "overdue"
      maintenance_request_priority: "low" | "medium" | "high"
      maintenance_request_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
      maintenance_status: "pending" | "completed" | "cancelled"
      meter_type: "electricity" | "water" | "gas"
      property_type: "Apartment" | "House" | "Condo" | "Commercial"
      scraping_status: "pending" | "in_progress" | "completed" | "failed"
      service_category:
        | "plumbing"
        | "electrical"
        | "hvac"
        | "carpentry"
        | "cleaning"
        | "painting"
        | "landscaping"
        | "general_maintenance"
        | "other"
      subscription_plan: "free" | "basic" | "premium" | "gold"
      tenant_action_type:
        | "invitation_sent"
        | "invitation_resent"
        | "invitation_accepted"
        | "tenant_assigned"
        | "tenancy_ended"
      utility_reading_type: "electricity" | "water" | "gas"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
