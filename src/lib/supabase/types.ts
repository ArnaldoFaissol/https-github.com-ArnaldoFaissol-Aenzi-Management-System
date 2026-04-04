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
      assets: {
        Row: {
          asset_name: string
          asset_status: string
          battery_level: number | null
          city: string | null
          contract_value: number | null
          created_at: string | null
          fcu_code: string | null
          id: string
          installation_date: string | null
          kwh_total: number | null
          latitude: number | null
          longitude: number | null
          mttr_hours: number | null
          region: string | null
          uf_code: string | null
          updated_at: string | null
          uptime: number | null
        }
        Insert: {
          asset_name: string
          asset_status: string
          battery_level?: number | null
          city?: string | null
          contract_value?: number | null
          created_at?: string | null
          fcu_code?: string | null
          id?: string
          installation_date?: string | null
          kwh_total?: number | null
          latitude?: number | null
          longitude?: number | null
          mttr_hours?: number | null
          region?: string | null
          uf_code?: string | null
          updated_at?: string | null
          uptime?: number | null
        }
        Update: {
          asset_name?: string
          asset_status?: string
          battery_level?: number | null
          city?: string | null
          contract_value?: number | null
          created_at?: string | null
          fcu_code?: string | null
          id?: string
          installation_date?: string | null
          kwh_total?: number | null
          latitude?: number | null
          longitude?: number | null
          mttr_hours?: number | null
          region?: string | null
          uf_code?: string | null
          updated_at?: string | null
          uptime?: number | null
        }
        Relationships: []
      }
      billing_cycles: {
        Row: {
          created_at: string | null
          id: string
          month: string
          region: string
          revenue: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          region: string
          revenue: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          region?: string
          revenue?: number
        }
        Relationships: []
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
// Table: assets
//   id: uuid (not null, default: gen_random_uuid())
//   fcu_code: text (nullable)
//   asset_name: text (not null)
//   asset_status: text (not null)
//   region: text (nullable)
//   uf_code: text (nullable)
//   city: text (nullable)
//   installation_date: date (nullable)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
//   battery_level: integer (nullable, default: 100)
//   contract_value: numeric (nullable)
//   uptime: numeric (nullable, default: 100.0)
//   kwh_total: numeric (nullable, default: 0)
//   mttr_hours: numeric (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: billing_cycles
//   id: uuid (not null, default: gen_random_uuid())
//   month: date (not null)
//   region: text (not null)
//   revenue: numeric (not null)
//   created_at: timestamp with time zone (nullable, default: now())
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
// Table: assets
//   UNIQUE assets_fcu_code_key: UNIQUE (fcu_code)
//   PRIMARY KEY assets_pkey: PRIMARY KEY (id)
// Table: billing_cycles
//   PRIMARY KEY billing_cycles_pkey: PRIMARY KEY (id)
// Table: rollout_backlog
//   PRIMARY KEY rollout_backlog_pkey: PRIMARY KEY (id)
// Table: telemetry_history
//   FOREIGN KEY telemetry_history_asset_id_fkey: FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
//   PRIMARY KEY telemetry_history_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
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
