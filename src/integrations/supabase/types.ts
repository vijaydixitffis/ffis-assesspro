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
      answers: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          marks: string | null
          question_id: string
          text: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          marks?: string | null
          question_id: string
          text: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          marks?: string | null
          question_id?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_assignments: {
        Row: {
          assessment_id: string
          assigned_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          scope: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          assigned_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          scope?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          assigned_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          scope?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_assignments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_submissions: {
        Row: {
          assessment_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          max_score: number | null
          score: number | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          score?: number | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          score?: number | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          id: string
          is_active: boolean
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean
          question: string
          sequence_number: number | null
          topic_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean
          question: string
          sequence_number?: number | null
          topic_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean
          question?: string
          sequence_number?: number | null
          topic_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      submitted_answers: {
        Row: {
          answer_id: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          marks: number | null
          question_id: string
          submission_id: string
          text_answer: string | null
          updated_at: string | null
        }
        Insert: {
          answer_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          marks?: number | null
          question_id: string
          submission_id: string
          text_answer?: string | null
          updated_at?: string | null
        }
        Update: {
          answer_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          marks?: number | null
          question_id?: string
          submission_id?: string
          text_answer?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submitted_answers_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submitted_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submitted_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assessment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          assessment_id: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          is_active: boolean
          sequence_number: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          is_active?: boolean
          sequence_number?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean
          sequence_number?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
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
