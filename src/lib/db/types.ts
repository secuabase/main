/**
 * Hand-written Database type for the Phase 1 schema.
 * Shape follows `supabase gen types` so it drops into `createClient<Database>()`.
 * Source of truth: supabase/migrations/*.sql. Update both together.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientStage = 'invited' | 'onboarding' | 'pilot' | 'paid' | 'paused' | 'leaving';
export type ClientHealth = 'on_track' | 'at_risk' | 'blocked';
export type MemberRole = 'owner' | 'editor' | 'viewer' | 'billing';
export type MemberStatus = 'invited' | 'active' | 'removed';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string | null;
          setup_fee_cents: number | null;
          monthly_cents: number | null;
          currency: string | null;
          product_limit: number | null;
          rule_limit: number | null;
          member_limit: number | null;
          pilot_days: number | null;
          sort: number | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          setup_fee_cents?: number | null;
          monthly_cents?: number | null;
          currency?: string | null;
          product_limit?: number | null;
          rule_limit?: number | null;
          member_limit?: number | null;
          pilot_days?: number | null;
          sort?: number | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          setup_fee_cents?: number | null;
          monthly_cents?: number | null;
          currency?: string | null;
          product_limit?: number | null;
          rule_limit?: number | null;
          member_limit?: number | null;
          pilot_days?: number | null;
          sort?: number | null;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          slug: string;
          stage: ClientStage;
          plan_id: string | null;
          country: string | null;
          currency: string | null;
          vat_id: string | null;
          health: ClientHealth;
          mrr_cents: number;
          pilot_ends_at: string | null;
          contact_name: string | null;
          contact_email: string | null;
          invited_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          stage?: ClientStage;
          plan_id?: string | null;
          country?: string | null;
          currency?: string | null;
          vat_id?: string | null;
          health?: ClientHealth;
          mrr_cents?: number;
          pilot_ends_at?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          invited_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          stage?: ClientStage;
          plan_id?: string | null;
          country?: string | null;
          currency?: string | null;
          vat_id?: string | null;
          health?: ClientHealth;
          mrr_cents?: number;
          pilot_ends_at?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          invited_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      client_members: {
        Row: {
          id: string;
          client_id: string;
          user_id: string | null;
          role: MemberRole;
          status: MemberStatus;
          invited_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          user_id?: string | null;
          role: MemberRole;
          status?: MemberStatus;
          invited_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          user_id?: string | null;
          role?: MemberRole;
          status?: MemberStatus;
          invited_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'client_members_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'client_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: number;
          client_id: string | null;
          actor_id: string | null;
          actor_role: string | null;
          action: string;
          object_type: string;
          object_id: string | null;
          before: Json | null;
          after: Json | null;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        // events has no insert/update policy; rows come from log_event().
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      client_role: {
        Args: { p_client_id: string };
        Returns: MemberRole | null;
      };
      has_client_role: {
        Args: { p_client_id: string; p_roles: MemberRole[] };
        Returns: boolean;
      };
      log_event: {
        Args: {
          p_client_id: string | null;
          p_action: string;
          p_object_type: string;
          p_object_id: string | null;
          p_before: Json | null;
          p_after: Json | null;
        };
        Returns: number;
      };
    };
    Enums: {
      client_stage: ClientStage;
      client_health: ClientHealth;
      member_role: MemberRole;
      member_status: MemberStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Profile = Tables<'profiles'>;
export type Plan = Tables<'plans'>;
export type Client = Tables<'clients'>;
export type ClientMember = Tables<'client_members'>;
export type AdminSetting = Tables<'admin_settings'>;
export type Event = Tables<'events'>;
