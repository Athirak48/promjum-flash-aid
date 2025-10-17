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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      decks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          description_en: string | null
          icon: string
          id: string
          is_premium: boolean | null
          name: string
          name_en: string
          total_flashcards: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          is_premium?: boolean | null
          name: string
          name_en: string
          total_flashcards?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          name_en?: string
          total_flashcards?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_text: string
          created_at: string | null
          front_text: string
          id: string
          subdeck_id: string | null
          upload_id: string | null
        }
        Insert: {
          back_text: string
          created_at?: string | null
          front_text: string
          id?: string
          subdeck_id?: string | null
          upload_id?: string | null
        }
        Update: {
          back_text?: string
          created_at?: string | null
          front_text?: string
          id?: string
          subdeck_id?: string | null
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subdeck_id_fkey"
            columns: ["subdeck_id"]
            isOneToOne: false
            referencedRelation: "sub_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      game_data: {
        Row: {
          created_at: string | null
          flashcard_id: string | null
          id: string
          last_reviewed: string | null
          srs_level: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          last_reviewed?: string | null
          srs_level?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          last_reviewed?: string | null
          srs_level?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_data_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      marketplace_cards: {
        Row: {
          created_at: string | null
          flashcard_id: string | null
          id: string
          price: number
          status: string
          updated_at: string | null
          uploader_id: string | null
        }
        Insert: {
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          price: number
          status?: string
          updated_at?: string | null
          uploader_id?: string | null
        }
        Update: {
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          price?: number
          status?: string
          updated_at?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_cards_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_cards_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string | null
          payment_session_id: string | null
          status: string
          updated_at: string | null
          upload_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_session_id?: string | null
          status?: string
          updated_at?: string | null
          upload_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_session_id?: string | null
          status?: string
          updated_at?: string | null
          upload_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pricing_history: {
        Row: {
          created_at: string | null
          id: string
          price_per_mb: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_mb: number
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_mb?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          buyer_id: string | null
          card_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          card_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          card_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "marketplace_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_decks: {
        Row: {
          created_at: string
          deck_id: string
          description: string | null
          description_en: string | null
          difficulty_level: string | null
          display_order: number | null
          flashcard_count: number | null
          id: string
          is_free: boolean | null
          name: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          description?: string | null
          description_en?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          flashcard_count?: number | null
          id?: string
          is_free?: boolean | null
          name: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          description?: string | null
          description_en?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          flashcard_count?: number | null
          id?: string
          is_free?: boolean | null
          name?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_decks_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string | null
          file_size_mb: number
          id: string
          original_file_name: string
          original_file_url: string
          payment_status: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_size_mb: number
          id?: string
          original_file_name: string
          original_file_url: string
          payment_status?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_size_mb?: number
          id?: string
          original_file_name?: string
          original_file_url?: string
          payment_status?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_deck_progress: {
        Row: {
          created_at: string
          deck_id: string
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_deck_progress_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subdeck_progress: {
        Row: {
          cards_learned: number | null
          created_at: string
          id: string
          is_completed: boolean | null
          last_accessed: string | null
          subdeck_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cards_learned?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          subdeck_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cards_learned?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          subdeck_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subdeck_progress_subdeck_id_fkey"
            columns: ["subdeck_id"]
            isOneToOne: false
            referencedRelation: "sub_decks"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
