export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          dentist_id: string
          id: string
          insurance_provider: string | null
          manage_token_hash: string
          patient_id: string
          patient_notes: string | null
          payment_method: Database['public']['Enums']['payment_method']
          period: unknown
          rescheduled_count: number
          source: Database['public']['Enums']['appointment_source']
          status: Database['public']['Enums']['appointment_status']
          treatment_id: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          dentist_id: string
          id?: string
          insurance_provider?: string | null
          manage_token_hash: string
          patient_id: string
          patient_notes?: string | null
          payment_method: Database['public']['Enums']['payment_method']
          period: unknown
          rescheduled_count?: number
          source?: Database['public']['Enums']['appointment_source']
          status?: Database['public']['Enums']['appointment_status']
          treatment_id: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          dentist_id?: string
          id?: string
          insurance_provider?: string | null
          manage_token_hash?: string
          patient_id?: string
          patient_notes?: string | null
          payment_method?: Database['public']['Enums']['payment_method']
          period?: unknown
          rescheduled_count?: number
          source?: Database['public']['Enums']['appointment_source']
          status?: Database['public']['Enums']['appointment_status']
          treatment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: false
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_treatment_id_fkey'
            columns: ['treatment_id']
            isOneToOne: false
            referencedRelation: 'treatments'
            referencedColumns: ['id']
          },
        ]
      }
      dentist_treatments: {
        Row: {
          dentist_id: string
          treatment_id: string
        }
        ComputedFields: never
        Insert: {
          dentist_id: string
          treatment_id: string
        }
        Update: {
          dentist_id?: string
          treatment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dentist_treatments_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: false
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'dentist_treatments_treatment_id_fkey'
            columns: ['treatment_id']
            isOneToOne: false
            referencedRelation: 'treatments'
            referencedColumns: ['id']
          },
        ]
      }
      dentists: {
        Row: {
          bio: string[]
          created_at: string
          cro_registration: string
          display_name: string
          education: string[]
          full_name: string
          headline: string
          id: string
          is_active: boolean
          is_technical_lead: boolean
          photo_key: string
          slug: string
          sort_order: number
          specialty: Database['public']['Enums']['specialty']
        }
        ComputedFields: never
        Insert: {
          bio: string[]
          created_at?: string
          cro_registration: string
          display_name: string
          education?: string[]
          full_name: string
          headline: string
          id?: string
          is_active?: boolean
          is_technical_lead?: boolean
          photo_key: string
          slug: string
          sort_order?: number
          specialty: Database['public']['Enums']['specialty']
        }
        Update: {
          bio?: string[]
          created_at?: string
          cro_registration?: string
          display_name?: string
          education?: string[]
          full_name?: string
          headline?: string
          id?: string
          is_active?: boolean
          is_technical_lead?: boolean
          photo_key?: string
          slug?: string
          sort_order?: number
          specialty?: Database['public']['Enums']['specialty']
        }
        Relationships: []
      }
      holidays: {
        Row: {
          date: string
          name: string
        }
        ComputedFields: never
        Insert: {
          date: string
          name: string
        }
        Update: {
          date?: string
          name?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          appointment_id: string
          appointment_starts_at: string
          attempts: number
          channel: string
          created_at: string
          id: string
          kind: Database['public']['Enums']['notification_kind']
          last_error: string | null
          provider_message_id: string | null
          status: Database['public']['Enums']['delivery_status']
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          appointment_id: string
          appointment_starts_at: string
          attempts?: number
          channel: string
          created_at?: string
          id?: string
          kind: Database['public']['Enums']['notification_kind']
          last_error?: string | null
          provider_message_id?: string | null
          status?: Database['public']['Enums']['delivery_status']
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          appointment_starts_at?: string
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          kind?: Database['public']['Enums']['notification_kind']
          last_error?: string | null
          provider_message_id?: string | null
          status?: Database['public']['Enums']['delivery_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_deliveries_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          dentist_id: string
          id: string
          period: unknown
          reason: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by?: string | null
          dentist_id: string
          id?: string
          period: unknown
          reason: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dentist_id?: string
          id?: string
          period?: unknown
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: 'schedule_blocks_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: false
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          },
        ]
      }
      staff_profiles: {
        Row: {
          created_at: string
          dentist_id: string | null
          full_name: string
          role: Database['public']['Enums']['staff_role']
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          dentist_id?: string | null
          full_name: string
          role: Database['public']['Enums']['staff_role']
          user_id: string
        }
        Update: {
          created_at?: string
          dentist_id?: string | null
          full_name?: string
          role?: Database['public']['Enums']['staff_role']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_profiles_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: true
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          },
        ]
      }
      treatments: {
        Row: {
          content: NonNullable<Json>
          created_at: string
          duration_minutes: number
          id: string
          is_bookable: boolean
          is_urgent: boolean
          name: string
          photo_key: string
          slug: string
          sort_order: number
          summary: string
        }
        ComputedFields: never
        Insert: {
          content?: NonNullable<Json>
          created_at?: string
          duration_minutes: number
          id?: string
          is_bookable?: boolean
          is_urgent?: boolean
          name: string
          photo_key: string
          slug: string
          sort_order?: number
          summary: string
        }
        Update: {
          content?: NonNullable<Json>
          created_at?: string
          duration_minutes?: number
          id?: string
          is_bookable?: boolean
          is_urgent?: boolean
          name?: string
          photo_key?: string
          slug?: string
          sort_order?: number
          summary?: string
        }
        Relationships: []
      }
      weekly_schedules: {
        Row: {
          dentist_id: string
          ends_at: string
          id: string
          lunch_ends_at: string | null
          lunch_starts_at: string | null
          starts_at: string
          weekday: number
        }
        ComputedFields: never
        Insert: {
          dentist_id: string
          ends_at: string
          id?: string
          lunch_ends_at?: string | null
          lunch_starts_at?: string | null
          starts_at: string
          weekday: number
        }
        Update: {
          dentist_id?: string
          ends_at?: string
          id?: string
          lunch_ends_at?: string | null
          lunch_starts_at?: string | null
          starts_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'weekly_schedules_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: false
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_appointment: {
        Args: {
          p_appointment_id: string
          p_dentist_id: string
          p_insurance_provider?: string
          p_manage_token_hash: string
          p_patient_email: string
          p_patient_name: string
          p_patient_notes?: string
          p_patient_phone: string
          p_payment_method: Database['public']['Enums']['payment_method']
          p_starts_at: string
          p_treatment_id: string
        }
        Returns: string
      }
      claim_reminders: {
        Args: { p_channel: string; p_from: string; p_to: string }
        Returns: {
          appointment_id: string
          delivery_id: string
          dentist_name: string
          ends_at: string
          patient_email: string
          patient_name: string
          patient_phone: string
          starts_at: string
          treatment_name: string
        }[]
      }
      get_busy_periods: {
        Args: { p_dentist_ids: string[]; p_from: string; p_to: string }
        Returns: {
          dentist_id: string
          ends_at: string
          starts_at: string
        }[]
      }
      register_booking_attempt: {
        Args: { p_fingerprint: string; p_limit: number; p_window_minutes: number }
        Returns: boolean
      }
    }
    Enums: {
      appointment_source: 'website' | 'reception'
      appointment_status: 'scheduled' | 'cancelled' | 'completed' | 'no_show'
      delivery_status: 'pending' | 'sent' | 'failed'
      notification_kind: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'
      payment_method: 'private' | 'insurance'
      specialty: 'general_dentistry' | 'orthodontics' | 'implantology'
      staff_role: 'reception' | 'dentist'
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_source: ['website', 'reception'],
      appointment_status: ['scheduled', 'cancelled', 'completed', 'no_show'],
      delivery_status: ['pending', 'sent', 'failed'],
      notification_kind: ['confirmation', 'reminder', 'cancellation', 'reschedule'],
      payment_method: ['private', 'insurance'],
      specialty: ['general_dentistry', 'orthodontics', 'implantology'],
      staff_role: ['reception', 'dentist'],
    },
  },
} as const
