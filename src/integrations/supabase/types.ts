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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_name: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          donor_name?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_name?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          status?: string
        }
        Relationships: []
      }
      festivals: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          status: string
          tagline: string | null
          title: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          status?: string
          tagline?: string | null
          title: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          status?: string
          tagline?: string | null
          title?: string
          year?: number
        }
        Relationships: []
      }
      gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          festival_id: string | null
          id: string
          image_url: string
          link_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          festival_id?: string | null
          id?: string
          image_url: string
          link_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          festival_id?: string | null
          id?: string
          image_url?: string
          link_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string | null
          festival_id: string | null
          id: string
          image_url: string | null
          link_url: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          festival_id?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          festival_id?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          category: string | null
          created_at: string | null
          festival_years: number[]
          id: string
          name: string
          venue: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          festival_years?: number[]
          id?: string
          name: string
          venue?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          festival_years?: number[]
          id?: string
          name?: string
          venue?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          festival_id: string | null
          gallery_id: string | null
          id: string
          issue: string
          news_id: string | null
          reporter_name: string
          result_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          festival_id?: string | null
          gallery_id?: string | null
          id?: string
          issue: string
          news_id?: string | null
          reporter_name: string
          result_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          festival_id?: string | null
          gallery_id?: string | null
          id?: string
          issue?: string
          news_id?: string | null
          reporter_name?: string
          result_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "gallery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "results"
            referencedColumns: ["id"]
          },
        ]
      }
      result_requests: {
        Row: {
          created_at: string | null
          festival_id: string | null
          id: string
          program_name: string
          requester_name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          festival_id?: string | null
          id?: string
          program_name: string
          requester_name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          festival_id?: string | null
          id?: string
          program_name?: string
          requester_name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "result_requests_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          additional_grades: Json | null
          another_grade_name: string | null
          another_grade_points: number | null
          another_grade_team: string | null
          created_at: string | null
          festival_id: string | null
          first_place_grade: string | null
          first_place_name: string
          first_place_points: number | null
          first_place_team: string | null
          id: string
          is_visible: boolean
          poster_urls: string[] | null
          program_id: string | null
          result_number: number | null
          second_place_grade: string | null
          second_place_name: string
          second_place_points: number | null
          second_place_team: string | null
          third_place_grade: string | null
          third_place_name: string
          third_place_points: number | null
          third_place_team: string | null
        }
        Insert: {
          additional_grades?: Json | null
          another_grade_name?: string | null
          another_grade_points?: number | null
          another_grade_team?: string | null
          created_at?: string | null
          festival_id?: string | null
          first_place_grade?: string | null
          first_place_name: string
          first_place_points?: number | null
          first_place_team?: string | null
          id?: string
          is_visible?: boolean
          poster_urls?: string[] | null
          program_id?: string | null
          result_number?: number | null
          second_place_grade?: string | null
          second_place_name: string
          second_place_points?: number | null
          second_place_team?: string | null
          third_place_grade?: string | null
          third_place_name: string
          third_place_points?: number | null
          third_place_team?: string | null
        }
        Update: {
          additional_grades?: Json | null
          another_grade_name?: string | null
          another_grade_points?: number | null
          another_grade_team?: string | null
          created_at?: string | null
          festival_id?: string | null
          first_place_grade?: string | null
          first_place_name?: string
          first_place_points?: number | null
          first_place_team?: string | null
          id?: string
          is_visible?: boolean
          poster_urls?: string[] | null
          program_id?: string | null
          result_number?: number | null
          second_place_grade?: string | null
          second_place_name?: string
          second_place_points?: number | null
          second_place_team?: string | null
          third_place_grade?: string | null
          third_place_name?: string
          third_place_points?: number | null
          third_place_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_another_grade_team_fkey"
            columns: ["another_grade_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_first_place_team_fkey"
            columns: ["first_place_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_second_place_team_fkey"
            columns: ["second_place_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_third_place_team_fkey"
            columns: ["third_place_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          festival_id: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          festival_id?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          festival_id?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          festival_id: string | null
          grade: string | null
          id: string
          name: string
          points: number | null
          published_points: number | null
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          festival_id?: string | null
          grade?: string | null
          id?: string
          name: string
          points?: number | null
          published_points?: number | null
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          festival_id?: string | null
          grade?: string | null
          id?: string
          name?: string
          points?: number | null
          published_points?: number | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          festival_id: string | null
          id: string
          name: string
          points: number | null
          published_points: number | null
        }
        Insert: {
          created_at?: string | null
          festival_id?: string | null
          id?: string
          name: string
          points?: number | null
          published_points?: number | null
        }
        Update: {
          created_at?: string | null
          festival_id?: string | null
          id?: string
          name?: string
          points?: number | null
          published_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          festival_id: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          festival_id?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          festival_id?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
      get_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_admin: {
        Args: { p_password: string; p_username: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
