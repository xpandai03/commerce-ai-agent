import { NextResponse } from 'next/server'
import { promptStore } from '@/lib/prompt-store'

// Simple route to update the active prompt in memory
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, name } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Update the prompt in memory store
    const updatedPrompt = {
      id: 'custom',
      name: name || 'Custom Emer Assistant',
      content,
      is_active: true,
      version: 1,
      updated_at: new Date().toISOString()
    }

    promptStore.setActivePrompt(updatedPrompt)
    console.log('Prompt updated via /api/prompts/update')

    return NextResponse.json({
      ...updatedPrompt,
      source: 'memory',
      message: 'Prompt updated successfully!'
    })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}