// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      asset_transitions: {
        Row: {
          asset_id: string
          changed_by: string | null
          created_at: string
          from_step: string | null
          id: string
          to_step: string
        }
        Insert: {
          asset_id: string
          changed_by?: string | null
          created_at?: string
          from_step?: string | null
          id?: string
          to_step: string
        }
        Update: {
          asset_id?: string
          changed_by?: string | null
          created_at?: string
          from_step?: string | null
          id?: string
          to_step?: string
        }
        Relationships: [
          {
            foreignKeyName: 'asset_transitions_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          },
        ]
      }
      assets: {
        Row: {
          address: string | null
          air_conditioner: string | null
          armored: string | null
          asset_name: string
          asset_state: string
          battery_count: number | null
          battery_level: number | null
          bluetooth_lock_status: string | null
          cabinet_type: string | null
          city: string | null
          contract_value: number | null
          created_at: string | null
          fcu_code: string | null
          holder: string | null
          iams_registration: string | null
          id: string
          is_active: boolean | null
          is_in_stock: boolean | null
          latitude: number | null
          longitude: number | null
          mttr_hours: number | null
          network_type: string | null
          pendency: number | null
          process_status: string | null
          rack_key_info: string | null
          rack_serial_number: string | null
          rectifier_count: number | null
          sr_specification: string | null
          step_number: string | null
          uf_code: string | null
          updated_at: string | null
          uptime: number | null
          utility: string | null
        }
        Insert: {
          address?: string | null
          air_conditioner?: string | null
          armored?: string | null
          asset_name: string
          asset_state: string
          battery_count?: number | null
          battery_level?: number | null
          bluetooth_lock_status?: string | null
          cabinet_type?: string | null
          city?: string | null
          contract_value?: number | null
          created_at?: string | null
          fcu_code?: string | null
          holder?: string | null
          iams_registration?: string | null
          id?: string
          is_active?: boolean | null
          is_in_stock?: boolean | null
          latitude?: number | null
          longitude?: number | null
          mttr_hours?: number | null
          network_type?: string | null
          pendency?: number | null
          process_status?: string | null
          rack_key_info?: string | null
          rack_serial_number?: string | null
          rectifier_count?: number | null
          sr_specification?: string | null
          step_number?: string | null
          uf_code?: string | null
          updated_at?: string | null
          uptime?: number | null
          utility?: string | null
        }
        Update: {
          address?: string | null
          air_conditioner?: string | null
          armored?: string | null
          asset_name?: string
          asset_state?: string
          battery_count?: number | null
          battery_level?: number | null
          bluetooth_lock_status?: string | null
          cabinet_type?: string | null
          city?: string | null
          contract_value?: number | null
          created_at?: string | null
          fcu_code?: string | null
          holder?: string | null
          iams_registration?: string | null
          id?: string
          is_active?: boolean | null
          is_in_stock?: boolean | null
          latitude?: number | null
          longitude?: number | null
          mttr_hours?: number | null
          network_type?: string | null
          pendency?: number | null
          process_status?: string | null
          rack_key_info?: string | null
          rack_serial_number?: string | null
          rectifier_count?: number | null
          sr_specification?: string | null
          step_number?: string | null
          uf_code?: string | null
          updated_at?: string | null
          uptime?: number | null
          utility?: string | null
        }
        Relationships: []
      }
      billing_cycles: {
        Row: {
          asset_id: string | null
          created_at: string | null
          deductions: number | null
          id: string
          month: string
          opex: number | null
          region: string
          revenue: number
          taxes: number | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month: string
          opex?: number | null
          region: string
          revenue: number
          taxes?: number | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month?: string
          opex?: number | null
          region?: string
          revenue?: number
          taxes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'billing_cycles_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          },
        ]
      }
      rollout_backlog: {
        Row: {
          created_at: string | null
          id: string
          region: string
          site_id: string
          site_name: string
          status: string | null
          target_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          region: string
          site_id: string
          site_name: string
          status?: string | null
          target_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          region?: string
          site_id?: string
          site_name?: string
          status?: string | null
          target_date?: string | null
        }
        Relationships: []
      }
      telemetry_history: {
        Row: {
          asset_id: string | null
          battery_level: number
          id: string
          is_online: boolean | null
          kwh: number
          read_at: string | null
        }
        Insert: {
          asset_id?: string | null
          battery_level: number
          id?: string
          is_online?: boolean | null
          kwh: number
          read_at?: string | null
        }
        Update: {
          asset_id?: string | null
          battery_level?: number
          id?: string
          is_online?: boolean | null
          kwh?: number
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'telemetry_history_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_roi: {
        Args: { capex: number; opex: number; savings: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: asset_transitions
//   id: uuid (not null, default: gen_random_uuid())
//   asset_id: uuid (not null)
//   from_step: text (nullable)
//   to_step: text (not null)
//   changed_by: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: assets
//   id: uuid (not null, default: gen_random_uuid())
//   fcu_code: text (nullable)
//   asset_name: text (not null)
//   asset_state: text (not null)
//   utility: text (nullable)
//   uf_code: text (nullable)
//   city: text (nullable)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
//   battery_level: integer (nullable, default: 100)
//   contract_value: numeric (nullable)
//   uptime: numeric (nullable, default: 100.0)
//   pendency: numeric (nullable, default: 0)
//   mttr_hours: numeric (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   step_number: text (nullable)
//   network_type: text (nullable)
//   cabinet_type: text (nullable)
//   rack_serial_number: text (nullable)
//   bluetooth_lock_status: text (nullable)
//   iams_registration: text (nullable)
//   process_status: text (nullable)
//   address: text (nullable)
//   rack_key_info: text (nullable)
//   holder: text (nullable)
//   battery_count: integer (nullable)
//   rectifier_count: integer (nullable)
//   is_active: boolean (nullable, default: true)
//   is_in_stock: boolean (nullable, default: false)
//   sr_specification: text (nullable)
//   air_conditioner: text (nullable)
//   armored: text (nullable)
// Table: billing_cycles
//   id: uuid (not null, default: gen_random_uuid())
//   month: date (not null)
//   region: text (not null)
//   revenue: numeric (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   asset_id: uuid (nullable)
//   taxes: numeric (nullable, default: 0)
//   deductions: numeric (nullable, default: 0)
//   opex: numeric (nullable, default: 0)
// Table: rollout_backlog
//   id: uuid (not null, default: gen_random_uuid())
//   site_id: text (not null)
//   site_name: text (not null)
//   region: text (not null)
//   target_date: date (nullable)
//   status: text (nullable, default: 'Pendente'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: telemetry_history
//   id: uuid (not null, default: gen_random_uuid())
//   asset_id: uuid (nullable)
//   read_at: timestamp with time zone (nullable, default: now())
//   kwh: numeric (not null)
//   battery_level: integer (not null)
//   is_online: boolean (nullable, default: true)

// --- CONSTRAINTS ---
// Table: asset_transitions
//   FOREIGN KEY asset_transitions_asset_id_fkey: FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
//   FOREIGN KEY asset_transitions_changed_by_fkey: FOREIGN KEY (changed_by) REFERENCES auth.users(id)
//   PRIMARY KEY asset_transitions_pkey: PRIMARY KEY (id)
// Table: assets
//   UNIQUE assets_fcu_code_key: UNIQUE (fcu_code)
//   PRIMARY KEY assets_pkey: PRIMARY KEY (id)
// Table: billing_cycles
//   FOREIGN KEY billing_cycles_asset_id_fkey: FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
//   PRIMARY KEY billing_cycles_pkey: PRIMARY KEY (id)
// Table: rollout_backlog
//   PRIMARY KEY rollout_backlog_pkey: PRIMARY KEY (id)
// Table: telemetry_history
//   FOREIGN KEY telemetry_history_asset_id_fkey: FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
//   PRIMARY KEY telemetry_history_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: asset_transitions
//   Policy "authenticated_all_transitions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: assets
//   Policy "authenticated_all_assets" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: billing_cycles
//   Policy "authenticated_all_billing" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: rollout_backlog
//   Policy "authenticated_all_rollout" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: telemetry_history
//   Policy "authenticated_all_telemetry" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION calculate_roi(numeric, numeric, numeric)
//   CREATE OR REPLACE FUNCTION public.calculate_roi(capex numeric, savings numeric, opex numeric)
//    RETURNS numeric
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     net_savings NUMERIC;
//   BEGIN
//     net_savings := savings - opex;
//     IF net_savings <= 0 THEN
//       RETURN 0;
//     END IF;
//     RETURN ROUND((capex / net_savings) * 12, 1);
//   END;
//   $function$
//

// --- INDEXES ---
// Table: assets
//   CREATE UNIQUE INDEX assets_fcu_code_key ON public.assets USING btree (fcu_code)
//   CREATE INDEX idx_assets_city ON public.assets USING btree (city)
//   CREATE INDEX idx_assets_status ON public.assets USING btree (asset_state)
//   CREATE INDEX idx_assets_uf_code ON public.assets USING btree (uf_code)
