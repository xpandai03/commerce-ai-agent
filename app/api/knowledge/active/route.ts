import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { promptStore } from '@/lib/prompt-store'

export async function GET() {
  try {
    // First try to get from memory store
    const memoryEntries = promptStore.getKnowledgeEntries()
    const activeMemoryEntries = memoryEntries.filter(e => e.is_active !== false)

    if (activeMemoryEntries.length > 0) {
      console.log('Returning active knowledge entries from memory:', activeMemoryEntries.length)
      return NextResponse.json(activeMemoryEntries)
    }

    // Then try database if available
    if (supabase) {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('created_at', { ascending: false })

      if (!error && data) {
        console.log('Returning active knowledge entries from database:', data.length)
        return NextResponse.json(data)
      }

      if (error) {
        console.error('Error fetching from database:', error)
      }
    }

    console.log('No knowledge entries found')
    return NextResponse.json([])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json([])
  }
}