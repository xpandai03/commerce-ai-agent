import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string
          name: string
          content: string
          is_active: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['prompts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>
      }
      knowledge_entries: {
        Row: {
          id: string
          category: string
          title: string
          content: string
          tags: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['knowledge_entries']['Insert']>
      }
      prompt_history: {
        Row: {
          id: string
          prompt_id: string
          content: string
          changed_by: string
          changed_at: string
        }
        Insert: Omit<Database['public']['Tables']['prompt_history']['Row'], 'id' | 'changed_at'>
        Update: Partial<Database['public']['Tables']['prompt_history']['Insert']>
      }
    }
  }
}