
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
        };
        Relationships: []
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}
