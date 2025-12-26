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
          display_order: number | null
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
          display_order?: number | null
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
          display_order?: number | null
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
          comment: string | null
          created_at: string
          feature_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          feature_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
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
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
      feedback: {
        Row: {
          admin_notes: string | null
          category: string
          contact_permission: boolean | null
          created_at: string
          email: string | null
          feedback_type: string
          id: string
          message: string
          rating: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          contact_permission?: boolean | null
          created_at?: string
          email?: string | null
          feedback_type: string
          id?: string
          message: string
          rating?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          contact_permission?: boolean | null
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          message?: string
          rating?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      friendships: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      game_results: {
        Row: {
          correct_count: number | null
          game_index: number
          game_type: string
          id: string
          rank: number | null
          room_id: string
          score: number | null
          scoring_type: string | null
          submitted_at: string | null
          time_ms: number | null
          total_count: number | null
          user_id: string
        }
        Insert: {
          correct_count?: number | null
          game_index: number
          game_type: string
          id?: string
          rank?: number | null
          room_id: string
          score?: number | null
          scoring_type?: string | null
          submitted_at?: string | null
          time_ms?: number | null
          total_count?: number | null
          user_id: string
        }
        Update: {
          correct_count?: number | null
          game_index?: number
          game_type?: string
          id?: string
          rank?: number | null
          room_id?: string
          score?: number | null
          scoring_type?: string | null
          submitted_at?: string | null
          time_ms?: number | null
          total_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_results_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string | null
          current_game_index: number | null
          finished_at: string | null
          host_id: string
          id: string
          max_players: number | null
          max_vocab: number | null
          min_vocab: number | null
          room_code: string
          selected_games: string[] | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          current_game_index?: number | null
          finished_at?: string | null
          host_id: string
          id?: string
          max_players?: number | null
          max_vocab?: number | null
          min_vocab?: number | null
          room_code: string
          selected_games?: string[] | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          current_game_index?: number | null
          finished_at?: string | null
          host_id?: string
          id?: string
          max_players?: number | null
          max_vocab?: number | null
          min_vocab?: number | null
          room_code?: string
          selected_games?: string[] | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      individual_challenge_vocab: {
        Row: {
          back: string
          created_at: string | null
          front: string
          id: string
          month: number
          part_of_speech: string | null
          year: number
        }
        Insert: {
          back: string
          created_at?: string | null
          front: string
          id?: string
          month: number
          part_of_speech?: string | null
          year: number
        }
        Update: {
          back?: string
          created_at?: string | null
          front?: string
          id?: string
          month?: number
          part_of_speech?: string | null
          year?: number
        }
        Relationships: []
      }
      lobby_activities: {
        Row: {
          clicked_at: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          blocked_at: string | null
          blocked_reason: string | null
          challenge_nickname: string | null
          created_at: string
          current_streak: number | null
          email: string | null
          friend_code: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          last_activity_date: string | null
          learner_accent: string | null
          longest_streak: number | null
          nickname: string | null
          phone: string | null
          role: string
          shadowing_speed: number | null
          target_level: string | null
          total_xp: number | null
          tts_accent: string | null
          tts_speed: number | null
          tts_voice: string | null
          updated_at: string
          user_id: string
          words_learned: number | null
        }
        Insert: {
          auto_play_audio?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          challenge_nickname?: string | null
          created_at?: string
          current_streak?: number | null
          email?: string | null
          friend_code?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_activity_date?: string | null
          learner_accent?: string | null
          longest_streak?: number | null
          nickname?: string | null
          phone?: string | null
          role?: string
          shadowing_speed?: number | null
          target_level?: string | null
          total_xp?: number | null
          tts_accent?: string | null
          tts_speed?: number | null
          tts_voice?: string | null
          updated_at?: string
          user_id: string
          words_learned?: number | null
        }
        Update: {
          auto_play_audio?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          challenge_nickname?: string | null
          created_at?: string
          current_streak?: number | null
          email?: string | null
          friend_code?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_activity_date?: string | null
          learner_accent?: string | null
          longest_streak?: number | null
          nickname?: string | null
          phone?: string | null
          role?: string
          shadowing_speed?: number | null
          target_level?: string | null
          total_xp?: number | null
          tts_accent?: string | null
          tts_speed?: number | null
          tts_voice?: string | null
          updated_at?: string
          user_id?: string
          words_learned?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      room_players: {
        Row: {
          avatar_url: string | null
          final_rank: number | null
          id: string
          is_host: boolean | null
          is_ready: boolean | null
          joined_at: string | null
          nickname: string | null
          room_id: string
          total_score: number | null
          total_time_ms: number | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          final_rank?: number | null
          id?: string
          is_host?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          nickname?: string | null
          room_id: string
          total_score?: number | null
          total_time_ms?: number | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          final_rank?: number | null
          id?: string
          is_host?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          nickname?: string | null
          room_id?: string
          total_score?: number | null
          total_time_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_vocabulary: {
        Row: {
          added_by: string | null
          back_text: string
          created_at: string | null
          flashcard_id: string
          front_text: string
          id: string
          room_id: string
        }
        Insert: {
          added_by?: string | null
          back_text: string
          created_at?: string | null
          flashcard_id: string
          front_text: string
          id?: string
          room_id: string
        }
        Update: {
          added_by?: string | null
          back_text?: string
          created_at?: string | null
          flashcard_id?: string
          front_text?: string
          id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_vocabulary_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reviews: {
        Row: {
          activity_type: string
          color: string
          created_at: string
          duration_minutes: number
          icon: string
          id: string
          scheduled_date: string
          scheduled_time: string
          title: string
          updated_at: string
          user_id: string
          vocabulary_ids: string[]
        }
        Insert: {
          activity_type?: string
          color?: string
          created_at?: string
          duration_minutes?: number
          icon?: string
          id?: string
          scheduled_date: string
          scheduled_time: string
          title?: string
          updated_at?: string
          user_id: string
          vocabulary_ids: string[]
        }
        Update: {
          activity_type?: string
          color?: string
          created_at?: string
          duration_minutes?: number
          icon?: string
          id?: string
          scheduled_date?: string
          scheduled_time?: string
          title?: string
          updated_at?: string
          user_id?: string
          vocabulary_ids?: string[]
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
          is_published: boolean | null
          level: string | null
          name: string
          name_en: string
          published_at: string | null
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
          is_published?: boolean | null
          level?: string | null
          name: string
          name_en: string
          published_at?: string | null
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
          is_published?: boolean | null
          level?: string | null
          name?: string
          name_en?: string
          published_at?: string | null
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
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string
          price_paid: number | null
          promotion_code: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type: string
          price_paid?: number | null
          promotion_code?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          price_paid?: number | null
          promotion_code?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      universities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          rival_id: string | null
          short_name: string
          total_players: number | null
          total_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          rival_id?: string | null
          short_name: string
          total_players?: number | null
          total_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          rival_id?: string | null
          short_name?: string
          total_players?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "universities_rival_id_fkey"
            columns: ["rival_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      university_war_scores: {
        Row: {
          game_mode: string
          id: string
          played_at: string | null
          score: number
          university_id: string
          user_id: string
        }
        Insert: {
          game_mode: string
          id?: string
          played_at?: string | null
          score?: number
          university_id: string
          user_id: string
        }
        Update: {
          game_mode?: string
          id?: string
          played_at?: string | null
          score?: number
          university_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_war_scores_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
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
      user_decks: {
        Row: {
          card_count: number | null
          created_at: string
          description: string | null
          folder_id: string | null
          icon: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          icon?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          icon?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_decks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "user_folders"
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
          srs_score: number | null
          times_correct: number | null
          times_reviewed: number | null
          updated_at: string
          user_flashcard_id: string | null
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
          srs_score?: number | null
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string
          user_flashcard_id?: string | null
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
          srs_score?: number | null
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string
          user_flashcard_id?: string | null
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
          {
            foreignKeyName: "user_flashcard_progress_user_flashcard_id_fkey"
            columns: ["user_flashcard_id"]
            isOneToOne: false
            referencedRelation: "user_flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcard_sets: {
        Row: {
          card_count: number | null
          created_at: string
          folder_id: string | null
          id: string
          last_reviewed: string | null
          next_review: string | null
          progress: number | null
          source: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          folder_id?: string | null
          id?: string
          last_reviewed?: string | null
          next_review?: string | null
          progress?: number | null
          source?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          folder_id?: string | null
          id?: string
          last_reviewed?: string | null
          next_review?: string | null
          progress?: number | null
          source?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_sets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "user_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcards: {
        Row: {
          back_image_url: string | null
          back_text: string
          created_at: string
          flashcard_set_id: string
          front_image_url: string | null
          front_text: string
          id: string
          part_of_speech: string | null
          subdeck_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back_image_url?: string | null
          back_text: string
          created_at?: string
          flashcard_set_id: string
          front_image_url?: string | null
          front_text: string
          id?: string
          part_of_speech?: string | null
          subdeck_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back_image_url?: string | null
          back_text?: string
          created_at?: string
          flashcard_set_id?: string
          front_image_url?: string | null
          front_text?: string
          id?: string
          part_of_speech?: string | null
          subdeck_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcards_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "user_flashcard_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_flashcards_subdeck_id_fkey"
            columns: ["subdeck_id"]
            isOneToOne: false
            referencedRelation: "user_subdecks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_folders: {
        Row: {
          card_sets_count: number | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_sets_count?: number | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_sets_count?: number | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string | null
          current_value: number
          emoji: string | null
          goal_type: string
          icon_name: string | null
          id: string
          is_completed: boolean | null
          target_value: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          emoji?: string | null
          goal_type: string
          icon_name?: string | null
          id?: string
          is_completed?: boolean | null
          target_value?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number
          emoji?: string | null
          goal_type?: string
          icon_name?: string | null
          id?: string
          is_completed?: boolean | null
          target_value?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_subdeck_purchases: {
        Row: {
          amount_paid: number | null
          created_at: string
          id: string
          purchase_date: string
          subdeck_id: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          id?: string
          purchase_date?: string
          subdeck_id: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          id?: string
          purchase_date?: string
          subdeck_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subdecks: {
        Row: {
          card_count: number | null
          created_at: string
          deck_id: string
          description: string | null
          difficulty_level: string | null
          display_order: number | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          deck_id: string
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          deck_id?: string
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subdecks_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "user_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_universities: {
        Row: {
          created_at: string | null
          faculty: string | null
          id: string
          university_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          faculty?: string | null
          id?: string
          university_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          faculty?: string | null
          id?: string
          university_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_universities_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          created_at: string | null
          flashcard_xp_today: number | null
          games_xp_today: number | null
          id: string
          last_daily_reset: string | null
          level: number
          total_xp: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flashcard_xp_today?: number | null
          games_xp_today?: number | null
          id?: string
          last_daily_reset?: string | null
          level?: number
          total_xp?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flashcard_xp_today?: number | null
          games_xp_today?: number | null
          id?: string
          last_daily_reset?: string | null
          level?: number
          total_xp?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vocab_challenge_unlocks: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_config: {
        Row: {
          daily_limit: number | null
          description: string | null
          id: string
          source: string
          updated_at: string | null
          xp_completion_bonus: number | null
          xp_per_action: number | null
        }
        Insert: {
          daily_limit?: number | null
          description?: string | null
          id?: string
          source: string
          updated_at?: string | null
          xp_completion_bonus?: number | null
          xp_per_action?: number | null
        }
        Update: {
          daily_limit?: number | null
          description?: string | null
          id?: string
          source?: string
          updated_at?: string | null
          xp_completion_bonus?: number | null
          xp_per_action?: number | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          source_detail: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source: string
          source_detail?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          source_detail?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: { p_request_id: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      add_xp: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_source: string
          p_source_detail?: string
          p_user_id: string
        }
        Returns: {
          level_up: boolean
          new_level: number
          new_xp: number
          xp_added: number
        }[]
      }
      calculate_final_rankings: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      check_nickname_available: {
        Args: { p_current_user_id?: string; p_nickname: string }
        Returns: {
          available: boolean
          message: string
        }[]
      }
      cleanup_orphaned_progress: { Args: never; Returns: number }
      create_game_room: {
        Args: { p_host_id: string; p_max_players?: number }
        Returns: {
          room_code: string
          room_id: string
        }[]
      }
      generate_friend_code: { Args: never; Returns: string }
      generate_room_code: { Args: never; Returns: string }
      get_friends_leaderboard: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          friend_id: string
          level: number
          nickname: string
          rank: number
          total_xp: number
        }[]
      }
      get_lobby_stats: {
        Args: { p_user_id: string }
        Returns: {
          has_joined: boolean
          total_count: number
        }[]
      }
      get_pending_friend_requests: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          level: number
          nickname: string
          request_id: string
          requested_at: string
          requester_id: string
          total_xp: number
        }[]
      }
      get_room_details: {
        Args: { p_room_code: string }
        Returns: {
          created_at: string
          current_game_index: number
          host_id: string
          max_players: number
          player_count: number
          room_code: string
          room_id: string
          selected_games: string[]
          status: string
        }[]
      }
      get_user_xp: {
        Args: { p_user_id: string }
        Returns: {
          flashcard_xp_remaining: number
          flashcard_xp_today: number
          games_xp_remaining: number
          games_xp_today: number
          level: number
          total_xp: number
          xp_to_next_level: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_lobby_event: {
        Args: { p_user_id: string }
        Returns: {
          message: string
          new_count: number
          success: boolean
        }[]
      }
      join_room_by_code: {
        Args: { p_room_code: string; p_user_id: string }
        Returns: {
          message: string
          room_id: string
          success: boolean
        }[]
      }
      reject_friend_request: {
        Args: { p_request_id: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      remove_friend: {
        Args: { p_friend_id: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      reset_my_progress: { Args: never; Returns: undefined }
      search_users_by_nickname: {
        Args: { p_current_user_id: string; p_search_query: string }
        Returns: {
          avatar_url: string
          friend_code: string
          friendship_status: string
          level: number
          nickname: string
          total_xp: number
          user_id: string
        }[]
      }
      send_friend_request: {
        Args: { p_addressee_id: string; p_requester_id: string }
        Returns: {
          message: string
          request_id: string
          success: boolean
        }[]
      }
      set_nickname: {
        Args: { p_nickname: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      submit_game_result: {
        Args: {
          p_correct_count: number
          p_game_index: number
          p_game_type: string
          p_room_id: string
          p_score: number
          p_time_ms: number
          p_total_count: number
          p_user_id: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
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
