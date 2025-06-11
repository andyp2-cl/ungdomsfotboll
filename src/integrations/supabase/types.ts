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
      activities: {
        Row: {
          away_score: number | null
          created_at: string
          cup_id: string | null
          date: string
          home_score: number | null
          id: string
          is_win: boolean | null
          kiosk_assigned_player_id: string | null
          league_id: string | null
          location_description: string | null
          location_gps_link: string | null
          location_name: string | null
          match_report: string | null
          name: string
          player_stats: Json | null
          result: string | null
          scraped: boolean | null
          time: string | null
          type: string
          youtube_link: string | null
        }
        Insert: {
          away_score?: number | null
          created_at?: string
          cup_id?: string | null
          date: string
          home_score?: number | null
          id: string
          is_win?: boolean | null
          kiosk_assigned_player_id?: string | null
          league_id?: string | null
          location_description?: string | null
          location_gps_link?: string | null
          location_name?: string | null
          match_report?: string | null
          name: string
          player_stats?: Json | null
          result?: string | null
          scraped?: boolean | null
          time?: string | null
          type: string
          youtube_link?: string | null
        }
        Update: {
          away_score?: number | null
          created_at?: string
          cup_id?: string | null
          date?: string
          home_score?: number | null
          id?: string
          is_win?: boolean | null
          kiosk_assigned_player_id?: string | null
          league_id?: string | null
          location_description?: string | null
          location_gps_link?: string | null
          location_name?: string | null
          match_report?: string | null
          name?: string
          player_stats?: Json | null
          result?: string | null
          scraped?: boolean | null
          time?: string | null
          type?: string
          youtube_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      database_logs: {
        Row: {
          action: string
          details: string | null
          entity_id: string
          entity_type: string
          id: string
          timestamp: string
        }
        Insert: {
          action: string
          details?: string | null
          entity_id: string
          entity_type: string
          id?: string
          timestamp?: string
        }
        Update: {
          action?: string
          details?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      leagues: {
        Row: {
          created_at: string
          division: string
          id: string
          name: string
          year: number
        }
        Insert: {
          created_at?: string
          division: string
          id?: string
          name: string
          year: number
        }
        Update: {
          created_at?: string
          division?: string
          id?: string
          name?: string
          year?: number
        }
        Relationships: []
      }
      player_activities: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          player_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id: string
          player_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_activities_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_development_history: {
        Row: {
          created_at: string
          development_data: Json
          id: string
          notes: string | null
          player_id: string
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          created_at?: string
          development_data: Json
          id?: string
          notes?: string | null
          player_id: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Update: {
          created_at?: string
          development_data?: Json
          id?: string
          notes?: string | null
          player_id?: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          development: string | null
          grade: string
          id: string
          image: string | null
          is_active: boolean
          jersey_number: string | null
          name: string
          position: string | null
        }
        Insert: {
          created_at?: string
          development?: string | null
          grade: string
          id: string
          image?: string | null
          is_active?: boolean
          jersey_number?: string | null
          name: string
          position?: string | null
        }
        Update: {
          created_at?: string
          development?: string | null
          grade?: string
          id?: string
          image?: string | null
          is_active?: boolean
          jersey_number?: string | null
          name?: string
          position?: string | null
        }
        Relationships: []
      }
      training_stats: {
        Row: {
          attendance: boolean
          created_at: string
          id: string
          notes: string | null
          performance_score: number | null
          player_id: string
          training_date: string
          training_type: string | null
          updated_at: string
        }
        Insert: {
          attendance?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          performance_score?: number | null
          player_id: string
          training_date: string
          training_type?: string | null
          updated_at?: string
        }
        Update: {
          attendance?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          performance_score?: number | null
          player_id?: string
          training_date?: string
          training_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      migrate_player_development: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
