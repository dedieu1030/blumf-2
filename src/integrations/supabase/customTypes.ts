
import { Database } from './types';

// This extends the Database type with our newly created tables
export interface ExtendedDatabase extends Database {
  public: {
    Tables: Database['public']['Tables'] & {
      client_category_mappings: {
        Row: {
          id: string;
          client_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          category_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_category_mappings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "client_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_category_mappings_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      stripe_invoices: {
        Row: {
          id: string;
          client_id: string;
          invoice_number: string;
          issued_date: string;
          due_date: string | null;
          paid_date: string | null;
          amount_total: number;
          status: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          invoice_number: string;
          issued_date: string;
          due_date?: string | null;
          paid_date?: string | null;
          amount_total: number;
          status: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          invoice_number?: string;
          issued_date?: string;
          due_date?: string | null;
          paid_date?: string | null;
          amount_total?: number;
          status?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      invoices: {
        Row: {
          id: string;
          client_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string | null;
          status: string;
          total_amount: number;
          created_at: string;
          updated_at: string;
          client_name?: string; // Add for simplified querying
        };
        Insert: {
          id?: string;
          client_id: string;
          invoice_number: string;
          issue_date: string;
          due_date?: string | null;
          status: string;
          total_amount: number;
          created_at?: string;
          updated_at?: string;
          client_name?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          invoice_number?: string;
          issue_date?: string;
          due_date?: string | null;
          status?: string;
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
          client_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          link: string | null;
          created_at: string;
          reference_type?: string;
          reference_id?: string;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
          reference_type?: string;
          reference_id?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
          reference_type?: string;
          reference_id?: string;
          metadata?: Record<string, any>;
        };
        Relationships: []
      };
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price_cents: number;
          currency?: string;
          category_id?: string;
          is_recurring: boolean;
          recurring_interval?: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price_cents: number;
          currency?: string;
          category_id?: string;
          is_recurring?: boolean;
          recurring_interval?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_cents?: number;
          currency?: string;
          category_id?: string;
          is_recurring?: boolean;
          recurring_interval?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: []
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description?: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: []
      };
      reminder_schedules: {
        Row: {
          id: string;
          name: string;
          enabled: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          enabled?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          enabled?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: []
      };
      reminder_rules: {
        Row: {
          id: string;
          schedule_id: string;
          trigger_type: string;
          trigger_value: number;
          email_subject: string;
          email_body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          trigger_type: string;
          trigger_value: number;
          email_subject?: string;
          email_body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          trigger_type?: string;
          trigger_value?: number;
          email_subject?: string;
          email_body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_rules_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "reminder_schedules";
            referencedColumns: ["id"];
          }
        ]
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}
