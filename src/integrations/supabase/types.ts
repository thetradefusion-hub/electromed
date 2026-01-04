export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          booking_type: string
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_mobile: string | null
          patient_name: string | null
          status: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          booking_type?: string
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_mobile?: string | null
          patient_name?: string | null
          status?: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          booking_type?: string
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_mobile?: string | null
          patient_name?: string | null
          status?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          doctor_id: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          doctor_id: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          doctor_id?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean
          slot_duration: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean
          slot_duration?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          slot_duration?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          clinic_address: string | null
          clinic_name: string | null
          created_at: string
          id: string
          qualification: string
          registration_no: string
          specialization: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          qualification: string
          registration_no: string
          specialization?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          qualification?: string
          registration_no?: string
          specialization?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicine_rules: {
        Row: {
          created_at: string
          description: string | null
          doctor_id: string | null
          dosage: string
          duration: string
          id: string
          is_global: boolean
          medicine_ids: string[]
          name: string
          priority: number
          symptom_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          dosage: string
          duration: string
          id?: string
          is_global?: boolean
          medicine_ids?: string[]
          name: string
          priority?: number
          symptom_ids?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          dosage?: string
          duration?: string
          id?: string
          is_global?: boolean
          medicine_ids?: string[]
          name?: string
          priority?: number
          symptom_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_rules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          category: string
          contra_indications: string | null
          created_at: string
          default_dosage: string | null
          doctor_id: string | null
          id: string
          indications: string | null
          is_global: boolean
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          category: string
          contra_indications?: string | null
          created_at?: string
          default_dosage?: string | null
          doctor_id?: string | null
          id?: string
          indications?: string | null
          is_global?: boolean
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          contra_indications?: string | null
          created_at?: string
          default_dosage?: string | null
          doctor_id?: string | null
          id?: string
          indications?: string | null
          is_global?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_reports: {
        Row: {
          analysis: Json
          created_at: string
          doctor_id: string
          file_name: string
          file_url: string
          id: string
          notes: string | null
          patient_id: string
          report_type: string
          updated_at: string
        }
        Insert: {
          analysis?: Json
          created_at?: string
          doctor_id: string
          file_name: string
          file_url: string
          id?: string
          notes?: string | null
          patient_id: string
          report_type: string
          updated_at?: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          doctor_id?: string
          file_name?: string
          file_url?: string
          id?: string
          notes?: string | null
          patient_id?: string
          report_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number
          case_type: string
          created_at: string
          doctor_id: string
          gender: string
          id: string
          mobile: string
          name: string
          patient_id: string
          updated_at: string
          visit_date: string
        }
        Insert: {
          address?: string | null
          age: number
          case_type?: string
          created_at?: string
          doctor_id: string
          gender: string
          id?: string
          mobile: string
          name: string
          patient_id: string
          updated_at?: string
          visit_date?: string
        }
        Update: {
          address?: string | null
          age?: number
          case_type?: string
          created_at?: string
          doctor_id?: string
          gender?: string
          id?: string
          mobile?: string
          name?: string
          patient_id?: string
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_templates: {
        Row: {
          advice: string | null
          created_at: string
          description: string | null
          diagnosis: string | null
          doctor_id: string
          id: string
          medicines: Json
          name: string
          symptoms: Json
          updated_at: string
        }
        Insert: {
          advice?: string | null
          created_at?: string
          description?: string | null
          diagnosis?: string | null
          doctor_id: string
          id?: string
          medicines?: Json
          name: string
          symptoms?: Json
          updated_at?: string
        }
        Update: {
          advice?: string | null
          created_at?: string
          description?: string | null
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          medicines?: Json
          name?: string
          symptoms?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          advice: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          medicines: Json
          patient_id: string
          prescription_no: string
          symptoms: Json
          updated_at: string
        }
        Insert: {
          advice?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          medicines?: Json
          patient_id: string
          prescription_no: string
          symptoms?: Json
          updated_at?: string
        }
        Update: {
          advice?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          medicines?: Json
          patient_id?: string
          prescription_no?: string
          symptoms?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          category: string
          created_at: string
          description: string | null
          doctor_id: string | null
          id: string
          is_global: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          id?: string
          is_global?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          id?: string
          is_global?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "doctor" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "doctor", "staff"],
    },
  },
} as const
