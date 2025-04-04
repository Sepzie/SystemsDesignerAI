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
          updated_at: string
          last_login: string
        }
        Insert: {
          id: string
          email: string
          name: string
          last_login?: string
        }
        Update: {
          email?: string
          name?: string
          last_login?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          tech_stack: string
          progress: number
          created_at: string
          updated_at: string

        }
        Insert: {
          user_id: string
          name: string
          description: string
          tech_stack?: string
          progress?: number
        }
        Update: {
          name?: string
          description?: string
          tech_stack?: string
          progress?: number
        }
      }
      assets: {
        Row: {
          id: string
          project_id: string
          name: string
          type: string
          content: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id: string
          name: string
          asset_type: string
          content: string
          metadata?: Json
        }
        Update: {
          name?: string
          type?: string
          content?: string
          metadata?: Json
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
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id: string
          title?: string
        }
        Update: {
          title?: string
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
          updated_at: string
        }
        Insert: {
          conversation_id: string
          role: string
          content: string
          metadata?: Json
        }
        Update: {
          content?: string
          metadata?: Json
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
}