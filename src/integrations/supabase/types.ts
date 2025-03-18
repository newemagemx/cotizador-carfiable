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
      app_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      cars: {
        Row: {
          brand: string
          created_at: string | null
          id: string
          image_url: string | null
          last_checked: string | null
          model: string
          price: string
          registration_type: string
          title: string
          updated_at: string | null
          url: string | null
          version: string | null
          year: string
        }
        Insert: {
          brand: string
          created_at?: string | null
          id: string
          image_url?: string | null
          last_checked?: string | null
          model: string
          price: string
          registration_type: string
          title: string
          updated_at?: string | null
          url?: string | null
          version?: string | null
          year: string
        }
        Update: {
          brand?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          last_checked?: string | null
          model?: string
          price?: string
          registration_type?: string
          title?: string
          updated_at?: string | null
          url?: string | null
          version?: string | null
          year?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          car_brand: string
          car_id: string | null
          car_model: string
          car_price: string
          car_year: string
          created_at: string
          down_payment_percentage: number
          id: string
          is_verified: boolean | null
          selected_term: number | null
          updated_at: string
          user_email: string
          user_name: string
          user_phone: string
          verification_code: string | null
        }
        Insert: {
          car_brand: string
          car_id?: string | null
          car_model: string
          car_price: string
          car_year: string
          created_at?: string
          down_payment_percentage: number
          id?: string
          is_verified?: boolean | null
          selected_term?: number | null
          updated_at?: string
          user_email: string
          user_name: string
          user_phone: string
          verification_code?: string | null
        }
        Update: {
          car_brand?: string
          car_id?: string | null
          car_model?: string
          car_price?: string
          car_year?: string
          created_at?: string
          down_payment_percentage?: number
          id?: string
          is_verified?: boolean | null
          selected_term?: number | null
          updated_at?: string
          user_email?: string
          user_name?: string
          user_phone?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          country_code: string
          created_at: string
          email: string
          id: string
          last_verified: string | null
          name: string
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          email: string
          id?: string
          last_verified?: string | null
          name: string
          phone: string
          role?: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          email?: string
          id?: string
          last_verified?: string | null
          name?: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
