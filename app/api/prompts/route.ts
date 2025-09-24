import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { promptStore } from '@/lib/prompt-store'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching prompts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, content, is_active, version } = body

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      )
    }

    // If database is available, try to save there
    if (supabase) {
      if (is_active) {
        await supabase
          .from('prompts')
          .update({ is_active: false })
          .eq('is_active', true)
      }

      const { data, error } = await supabase
        .from('prompts')
        .insert([{
          name,
          content,
          is_active: is_active || false,
          version: version || 1
        }])
        .select()
        .single()

      if (!error && data) {
        // Also update in memory store if active
        if (is_active) {
          promptStore.setActivePrompt(data)
        }
        return NextResponse.json(data)
      }
    }

    // Fallback to memory store
    const newPrompt = {
      id: Date.now().toString(),
      name,
      content,
      is_active: is_active || true,
      version: version || 1
    }

    if (is_active || !supabase) {
      promptStore.setActivePrompt(newPrompt)
    }

    return NextResponse.json({
      ...newPrompt,
      source: 'memory',
      message: 'Prompt saved in memory (will persist during this session)'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, content, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      )
    }

    // If database is available, try to save there
    if (supabase) {
      if (is_active) {
        await supabase
          .from('prompts')
          .update({ is_active: false })
          .eq('is_active', true)
          .neq('id', id)
      }

      const { data, error } = await supabase
        .from('prompts')
        .update({
          name,
          content,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        // Also update in memory store
        promptStore.setActivePrompt(data)
        return NextResponse.json(data)
      }
    }

    // Fallback to memory store
    const updatedPrompt = {
      id: id || 'custom',
      name: name || 'Custom Emer Assistant',
      content,
      is_active: true,
      version: 1
    }

    promptStore.setActivePrompt(updatedPrompt)

    return NextResponse.json({
      ...updatedPrompt,
      source: 'memory',
      message: 'Prompt saved in memory (will persist during this session)'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}