
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          grade: string
          position: string | null
          jersey_number: string | null
          image: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          grade: string
          position?: string | null
          jersey_number?: string | null
          image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade?: string
          position?: string | null
          jersey_number?: string | null
          image?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          name: string
          date: string
          type: string
          time: string | null
          location_name: string | null
          location_description: string | null
          location_gps_link: string | null
          kiosk_assigned_player_id: string | null
          scraped: boolean | null
          cup_id: string | null
          created_at: string
          home_score: number | null
          away_score: number | null
        }
        Insert: {
          id: string
          name: string
          date: string
          type: string
          time?: string | null
          location_name?: string | null
          location_description?: string | null
          location_gps_link?: string | null
          kiosk_assigned_player_id?: string | null
          scraped?: boolean | null
          cup_id?: string | null
          created_at?: string
          home_score?: number | null
          away_score?: number | null
        }
        Update: {
          id?: string
          name?: string
          date?: string
          type?: string
          time?: string | null
          location_name?: string | null
          location_description?: string | null
          location_gps_link?: string | null
          kiosk_assigned_player_id?: string | null
          scraped?: boolean | null
          cup_id?: string | null
          created_at?: string
          home_score?: number | null
          away_score?: number | null
        }
      }
      player_activities: {
        Row: {
          id: string
          player_id: string
          activity_id: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          activity_id: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          activity_id?: string
          created_at?: string
        }
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
  }
}
