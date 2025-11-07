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
      deck_analytics: {
        Row: {
          avg_completion_rate: number | null
          avg_success_rate: number | null
          deck_id: string | null
          id: string
          last_updated: string
          total_sessions: number | null
          total_users: number | null
        }
        Insert: {
          avg_completion_rate?: number | null
          avg_success_rate?: number | null
          deck_id?: string | null
          id?: string
          last_updated?: string
          total_sessions?: number | null
          total_users?: number | null
        }
        Update: {
          avg_completion_rate?: number | null
          avg_success_rate?: number | null
          deck_id?: string | null
          id?: string
          last_updated?: string
          total_sessions?: number | null
          total_users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_analytics_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: true
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_audit_log: {
        Row: {
          action: string
          changed_by: string
          changes: Json | null
          created_at: string
          deck_id: string | null
          id: string
        }
        Insert: {
          action: string
          changed_by: string
          changes?: Json | null
          created_at?: string
          deck_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          changed_by?: string
          changes?: Json | null
          created_at?: string
          deck_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_audit_log_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          category: string
          created_at: string
          default_tts_voice: string | null
          description: string | null
          description_en: string | null
          icon: string
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          language_variant: string | null
          level: string | null
          name: string
          name_en: string
          popularity_score: number | null
          published_at: string | null
          thumbnail_url: string | null
          total_flashcards: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_tts_voice?: string | null
          description?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          language_variant?: string | null
          level?: string | null
          name: string
          name_en: string
          popularity_score?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          total_flashcards?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_tts_voice?: string | null
          description?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          language_variant?: string | null
          level?: string | null
          name?: string
          name_en?: string
          popularity_score?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          total_flashcards?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      feature_reviews: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_reviews_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          audio_url: string | null
          audio_url_slow: string | null
          back_text: string
          created_at: string | null
          difficulty_score: number | null
          example_sentence_en: string | null
          example_sentence_th: string | null
          front_text: string
          id: string
          is_published: boolean | null
          language_variant: string | null
          level: string | null
          meaning_en: string | null
          meaning_th: string | null
          notes: string | null
          part_of_speech: string | null
          pronunciation_ipa: string | null
          published_at: string | null
          subdeck_id: string | null
          synonyms: string[] | null
          tags: string[] | null
          tts_voice: string | null
          upload_id: string | null
          word: string | null
        }
        Insert: {
          audio_url?: string | null
          audio_url_slow?: string | null
          back_text: string
          created_at?: string | null
          difficulty_score?: number | null
          example_sentence_en?: string | null
          example_sentence_th?: string | null
          front_text: string
          id?: string
          is_published?: boolean | null
          language_variant?: string | null
          level?: string | null
          meaning_en?: string | null
          meaning_th?: string | null
          notes?: string | null
          part_of_speech?: string | null
          pronunciation_ipa?: string | null
          published_at?: string | null
          subdeck_id?: string | null
          synonyms?: string[] | null
          tags?: string[] | null
          tts_voice?: string | null
          upload_id?: string | null
          word?: string | null
        }
        Update: {
          audio_url?: string | null
          audio_url_slow?: string | null
          back_text?: string
          created_at?: string | null
          difficulty_score?: number | null
          example_sentence_en?: string | null
          example_sentence_th?: string | null
          front_text?: string
          id?: string
          is_published?: boolean | null
          language_variant?: string | null
          level?: string | null
          meaning_en?: string | null
          meaning_th?: string | null
          notes?: string | null
          part_of_speech?: string | null
          pronunciation_ipa?: string | null
          published_at?: string | null
          subdeck_id?: string | null
          synonyms?: string[] | null
          tags?: string[] | null
          tts_voice?: string | null
          upload_id?: string | null
          word?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subdeck_id_fkey"
            columns: ["subdeck_id"]
            isOneToOne: false
            referencedRelation: "sub_decks"
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
      practice_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          deck_id: string | null
          duration_minutes: number | null
          grammar_avg: number | null
          id: string
          naturalness_avg: number | null
          pronunciation_avg: number | null
          session_mode: string
          session_type: string
          started_at: string
          subdeck_id: string | null
          user_id: string
          words_learned: number | null
          words_reviewed: number | null
          xp_gained: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          deck_id?: string | null
          duration_minutes?: number | null
          grammar_avg?: number | null
          id?: string
          naturalness_avg?: number | null
          pronunciation_avg?: number | null
          session_mode: string
          session_type: string
          started_at?: string
          subdeck_id?: string | null
          user_id: string
          words_learned?: number | null
          words_reviewed?: number | null
          xp_gained?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          deck_id?: string | null
          duration_minutes?: number | null
          grammar_avg?: number | null
          id?: string
          naturalness_avg?: number | null
          pronunciation_avg?: number | null
          session_mode?: string
          session_type?: string
          started_at?: string
          subdeck_id?: string | null
          user_id?: string
          words_learned?: number | null
          words_reviewed?: number | null
          xp_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_subdeck_id_fkey"
            columns: ["subdeck_id"]
            isOneToOne: false
            referencedRelation: "sub_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auto_play_audio: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          learner_accent: string | null
          phone: string | null
          role: string
          shadowing_speed: number | null
          target_level: string | null
          tts_accent: string | null
          tts_speed: number | null
          tts_voice: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_play_audio?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          learner_accent?: string | null
          phone?: string | null
          role?: string
          shadowing_speed?: number | null
          target_level?: string | null
          tts_accent?: string | null
          tts_speed?: number | null
          tts_voice?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_play_audio?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          learner_accent?: string | null
          phone?: string | null
          role?: string
          shadowing_speed?: number | null
          target_level?: string | null
          tts_accent?: string | null
          tts_speed?: number | null
          tts_voice?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sub_decks: {
        Row: {
          created_at: string
          deck_id: string
          description: string | null
          description_en: string | null
          difficulty_level: string | null
          display_order: number | null
          estimated_duration_minutes: number | null
          flashcard_count: number | null
          id: string
          is_free: boolean | null
          level: string | null
          name: string
          name_en: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          description?: string | null
          description_en?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          flashcard_count?: number | null
          id?: string
          is_free?: boolean | null
          level?: string | null
          name: string
          name_en: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          description?: string | null
          description_en?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          flashcard_count?: number | null
          id?: string
          is_free?: boolean | null
          level?: string | null
          name?: string
          name_en?: string
          tags?: string[] | null
          thumbnail_url?: string | null
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
      user_flashcard_progress: {
        Row: {
          created_at: string
          easiness_factor: number | null
          flashcard_id: string | null
          id: string
          interval_days: number | null
          is_starred: boolean | null
          last_review_score: number | null
          next_review_date: string | null
          srs_level: number | null
          times_correct: number | null
          times_reviewed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          easiness_factor?: number | null
          flashcard_id?: string | null
          id?: string
          interval_days?: number | null
          is_starred?: boolean | null
          last_review_score?: number | null
          next_review_date?: string | null
          srs_level?: number | null
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          easiness_factor?: number | null
          flashcard_id?: string | null
          id?: string
          interval_days?: number | null
          is_starred?: boolean | null
          last_review_score?: number | null
          next_review_date?: string | null
          srs_level?: number | null
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_phrasebook: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          notes: string | null
          phrase_en: string
          phrase_th: string | null
          related_words: string[] | null
          source: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          phrase_en: string
          phrase_th?: string | null
          related_words?: string[] | null
          source?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          phrase_en?: string
          phrase_th?: string | null
          related_words?: string[] | null
          source?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_speaking_attempts: {
        Row: {
          audio_url: string | null
          corrected_sentence: string | null
          created_at: string
          feedback_text: string | null
          feedback_th: string | null
          flashcard_id: string | null
          grammar_score: number | null
          id: string
          naturalness_score: number | null
          pronunciation_score: number | null
          pronunciation_tips: Json | null
          session_id: string | null
          target_sentence: string | null
          target_word: string | null
          user_id: string
          user_transcript: string
        }
        Insert: {
          audio_url?: string | null
          corrected_sentence?: string | null
          created_at?: string
          feedback_text?: string | null
          feedback_th?: string | null
          flashcard_id?: string | null
          grammar_score?: number | null
          id?: string
          naturalness_score?: number | null
          pronunciation_score?: number | null
          pronunciation_tips?: Json | null
          session_id?: string | null
          target_sentence?: string | null
          target_word?: string | null
          user_id: string
          user_transcript: string
        }
        Update: {
          audio_url?: string | null
          corrected_sentence?: string | null
          created_at?: string
          feedback_text?: string | null
          feedback_th?: string | null
          flashcard_id?: string | null
          grammar_score?: number | null
          id?: string
          naturalness_score?: number | null
          pronunciation_score?: number | null
          pronunciation_tips?: Json | null
          session_id?: string | null
          target_sentence?: string | null
          target_word?: string | null
          user_id?: string
          user_transcript?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_speaking_attempts_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_speaking_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "content_editor" | "user"
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
      app_role: ["admin", "teacher", "content_editor", "user"],
    },
  },
} as const
