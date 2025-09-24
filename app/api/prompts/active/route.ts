import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { promptStore } from '@/lib/prompt-store'

export async function GET() {
  try {
    // Always check memory store first - if there's a saved custom prompt, use it
    const memoryPrompt = promptStore.getActivePrompt()

    // If we have a custom prompt in memory (not the default), return it immediately
    if (memoryPrompt.id !== 'default') {
      console.log('Using custom prompt from memory store')
      return NextResponse.json(memoryPrompt)
    }

    // Then check database if available
    if (supabase) {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_active', true)
        .single()

      if (!error && data) {
        console.log('Using prompt from database')
        // Cache in memory for faster access
        promptStore.setActivePrompt(data)
        return NextResponse.json({
          ...data,
          source: 'database'
        })
      }
    }

    // Fall back to default from memory store
    console.log('Using default prompt')
    return NextResponse.json(memoryPrompt)
  } catch (error) {
    console.error('Error fetching active prompt:', error)
    // Return default prompt from store
    return NextResponse.json(promptStore.getActivePrompt())
  }
}