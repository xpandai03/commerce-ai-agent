import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { promptStore } from '@/lib/prompt-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('active')

    // First try to get from memory store
    let entries = promptStore.getKnowledgeEntries()

    if (entries.length > 0) {
      console.log('Returning knowledge entries from memory:', entries.length)

      // Apply filters if needed
      if (category && category !== 'all') {
        entries = entries.filter(e => e.category === category)
      }
      if (isActive !== null) {
        entries = entries.filter(e => e.is_active === (isActive === 'true'))
      }

      return NextResponse.json(entries)
    }

    // Then try database if available
    if (supabase) {
      let query = supabase.from('knowledge_entries').select('*')

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (isActive !== null) {
        query = query.eq('is_active', isActive === 'true')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (!error && data) {
        console.log('Returning knowledge entries from database:', data.length)
        return NextResponse.json(data)
      }

      if (error) {
        console.error('Error fetching from database:', error)
      }
    }

    return NextResponse.json([])
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
    const { category, title, content, tags, is_active } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Try database first if available
    if (supabase) {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert([{
          category,
          title,
          content,
          tags: tags || [],
          is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json(data)
      }
    }

    // Fallback to memory store
    const entry = {
      id: Date.now().toString(),
      category,
      title,
      content,
      tags: tags || [],
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    promptStore.addKnowledgeEntry(entry)
    console.log('Added knowledge entry to memory:', title)

    return NextResponse.json({
      ...entry,
      source: 'memory'
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
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }
    const body = await request.json()
    const { id, category, title, content, tags, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (category !== undefined) updateData.category = category
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (tags !== undefined) updateData.tags = tags
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('knowledge_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating knowledge entry:', error)
      return NextResponse.json(
        { error: 'Failed to update knowledge entry' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Try database first if available
    if (supabase) {
      const { error } = await supabase
        .from('knowledge_entries')
        .delete()
        .eq('id', id)

      if (!error) {
        return NextResponse.json({ success: true })
      }
    }

    // Fallback to memory store
    promptStore.deleteKnowledgeEntry(id)
    console.log('Deleted knowledge entry from memory:', id)

    return NextResponse.json({ success: true, source: 'memory' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}