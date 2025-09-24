import { NextResponse } from 'next/server'
import { promptStore } from '@/lib/prompt-store'
import { extractTextFromPDF } from '@/lib/pdf-parser'

// Use Node.js runtime for file processing
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'Documents'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)

    let text = ''

    // Handle PDF files with proper text extraction
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const buffer = await file.arrayBuffer()
        text = await extractTextFromPDF(buffer)
        console.log('PDF text extracted successfully, length:', text.length)

        if (!text || text.length < 50) {
          // If extraction failed, provide helpful error
          return NextResponse.json(
            {
              error: 'Could not extract readable text from this PDF.',
              suggestion: 'This may be a scanned or image-based PDF. Please try:\n1. Copy text from the PDF manually\n2. Save as a .txt file\n3. Upload the text file instead'
            },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('PDF extraction error:', error)
        return NextResponse.json(
          {
            error: 'Failed to process PDF file.',
            suggestion: 'Please save your content as a .txt or .md file and try again.'
          },
          { status: 400 }
        )
      }
    } else if (
      file.type === 'text/plain' ||
      file.type === 'text/markdown' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    ) {
      // Handle text files
      text = await file.text()
      console.log('Text file read successfully, length:', text.length)
    } else if (
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // Basic Word document support
      text = await file.text()
      // Clean up Word document artifacts
      text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim()
      console.log('Word doc processed, length:', text.length)
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type || 'unknown'}`,
          suggestion: 'Please upload a PDF, TXT, or MD file.'
        },
        { status: 400 }
      )
    }

    // Validate extracted text
    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        {
          error: 'Document is empty or too short (minimum 50 characters).',
          suggestion: 'Please ensure your document contains readable text.'
        },
        { status: 400 }
      )
    }

    // Clean and normalize the text
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim()

    console.log('Processing cleaned text, length:', cleanedText.length)

    // Split into meaningful sections
    let sections: string[] = []

    // Try to split by paragraphs first
    const paragraphs = cleanedText.split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 50 && p.split(' ').length > 10)

    if (paragraphs.length >= 3) {
      sections = paragraphs
    } else {
      // If not enough paragraphs, split by sentences
      const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || []
      let currentSection = ''

      for (const sentence of sentences) {
        currentSection += sentence + ' '
        if (currentSection.length > 300) {
          sections.push(currentSection.trim())
          currentSection = ''
        }
      }
      if (currentSection.trim().length > 50) {
        sections.push(currentSection.trim())
      }
    }

    // If still no sections, chunk the text
    if (sections.length < 3) {
      sections = []
      const chunkSize = 500
      for (let i = 0; i < cleanedText.length; i += chunkSize) {
        const chunk = cleanedText.substring(i, Math.min(i + chunkSize, cleanedText.length))
        if (chunk.trim().length > 50) {
          sections.push(chunk.trim())
        }
      }
    }

    if (sections.length === 0) {
      return NextResponse.json(
        { error: 'Could not create meaningful sections from the document' },
        { status: 400 }
      )
    }

    console.log(`Created ${sections.length} sections from document`)

    // Create knowledge entries
    const entries = []
    const maxSections = Math.min(sections.length, 20)

    for (let i = 0; i < maxSections; i++) {
      const section = sections[i]

      // Create meaningful title from first sentence or line
      let title = section.substring(0, 100).split(/[.!?\n]/)[0].trim()

      // Clean the title
      title = title
        .replace(/^[#\-*•·\s]+/, '')
        .replace(/\s+/g, ' ')
        .trim()

      // Use filename if title is too short
      if (!title || title.length < 10) {
        title = `${file.name.replace(/\.[^/.]+$/, '')} - Part ${i + 1}`
      }

      // Extract meaningful tags
      const words = section.toLowerCase().split(/[\s,;.!?()[\]{}'"]+/)
      const commonWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were',
        'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i',
        'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where',
        'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
        'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
        'just', 'for', 'with', 'from', 'to', 'of', 'in', 'by', 'about', 'into', 'through',
        'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over',
        'under', 'again', 'further', 'then', 'once'
      ])

      const meaningfulWords = words
        .filter(word =>
          word.length > 4 &&
          word.length < 20 &&
          !commonWords.has(word) &&
          /^[a-z]+$/.test(word)
        )

      // Count word frequency for tags
      const wordFreq: { [key: string]: number } = {}
      meaningfulWords.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      })

      // Get top 5 most frequent meaningful words as tags
      const tags = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word)

      // Create entry with unique ID
      const entry = {
        id: `${Date.now() + i}_${i}_${Math.random().toString(36).substring(2, 9)}`,
        category,
        title: title.substring(0, 200), // Limit title length
        content: section.substring(0, 3000), // Limit content size
        tags: tags.length > 0 ? tags : ['document', 'uploaded'],
        is_active: true,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add to memory store
      promptStore.addKnowledgeEntry(entry)
      entries.push(entry)

      console.log(`Created entry ${i + 1}: "${title.substring(0, 50)}..."`)
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create knowledge entries from document' },
        { status: 500 }
      )
    }

    console.log(`Successfully created ${entries.length} knowledge entries`)

    return NextResponse.json({
      message: `Successfully created ${entries.length} knowledge entries from "${file.name}"`,
      entries: entries.map(e => ({
        ...e,
        content: e.content.substring(0, 100) + '...', // Preview only
        source: 'memory'
      })),
      source: 'memory'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: `Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}