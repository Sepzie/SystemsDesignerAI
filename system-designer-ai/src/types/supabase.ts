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
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          last_login: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          last_login?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          requirements: Json
          tech_stack: string
          created_at: string
          updated_at: string
          progress: number
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          requirements?: Json
          tech_stack?: string
          created_at?: string
          updated_at?: string
          progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          requirements?: Json
          tech_stack?: string
          created_at?: string
          updated_at?: string
          progress?: number
        }
      }
      assets: {
        Row: {
          id: string
          project_id: string
          name: string
          asset_type: string
          created_at: string
          updated_at: string
          current_content: string
          current_version: number
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          asset_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          asset_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      asset_versions: {
        Row: {
          id: string
          asset_id: string
          version_number: number
          content: string
          metadata: Json
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          asset_id: string
          version_number: number
          content: string
          metadata?: Json
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          asset_id?: string
          version_number?: number
          content?: string
          metadata?: Json
          created_at?: string
          created_by?: string
        }
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          started_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          metadata?: Json
          created_at?: string
        }
      }
      exported_prompts: {
        Row: {
          id: string
          project_id: string
          name: string
          content: string
          prompt_type: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          content: string
          prompt_type: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          content?: string
          prompt_type?: string
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