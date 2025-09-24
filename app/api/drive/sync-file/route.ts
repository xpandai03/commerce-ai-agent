import { NextRequest, NextResponse } from 'next/server'
import googleDriveService from '@/lib/google-drive'
import { promptStore } from '@/lib/prompt-store'
import { vectorStore } from '@/lib/vector-store'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileName, mimeType } = await request.json()

    if (!fileId || !fileName) {
      return NextResponse.json({ error: 'File ID and name are required' }, { status: 400 })
    }

    if (!googleDriveService.isAuthenticated()) {
      // Try to authenticate with refresh token
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
      if (refreshToken) {
        googleDriveService.setRefreshToken(refreshToken)
      } else {
        return NextResponse.json({ error: 'Not authenticated with Google Drive' }, { status: 401 })
      }
    }

    // Get file content based on type
    let content = ''
    let category = 'Treatments' // Default category

    try {
      content = await googleDriveService.getFileContent(fileId, mimeType)

      // For base64 encoded PDFs, extract actual text content
      if (mimeType === 'application/pdf') {
        try {
          // Convert base64 to Buffer
          const buffer = Buffer.from(content, 'base64')
          // Parse PDF to extract text
          const pdfData = await pdf(buffer)
          content = pdfData.text
          console.log(`Extracted ${content.length} characters from PDF: ${fileName}`)
        } catch (pdfError) {
          console.error('Error parsing PDF:', pdfError)
          content = `PDF Document: ${fileName}\n\nError extracting PDF content: ${pdfError}`
        }
      }

      // Auto-categorize based on filename
      const lowerName = fileName.toLowerCase()
      if (lowerName.includes('price') || lowerName.includes('cost')) {
        category = 'Pricing'
      } else if (lowerName.includes('treatment') || lowerName.includes('procedure')) {
        category = 'Treatments'
      } else if (lowerName.includes('product')) {
        category = 'Documents'
      } else if (lowerName.includes('faq')) {
        category = 'FAQs'
      }
    } catch (error: any) {
      console.error('Error fetching file content:', error)
      content = `Unable to fetch content for ${fileName}. Error: ${error.message}`
    }

    // Generate unique document ID
    const documentId = `drive_${Date.now()}`

    // Add document to vector store with embeddings
    console.log('Adding document to vector store...')
    const vectorDocument = await vectorStore.addDocument(
      documentId,
      fileName,
      content,
      'drive'
    )

    // Also add to knowledge base for UI display
    const knowledgeItem = {
      id: documentId,
      title: fileName,
      content: content.substring(0, 500) + (content.length > 500 ? '...' : ''), // Store preview only
      category,
      tags: [],
      is_active: true,
      source: 'drive',
      fileName,
      driveFileId: fileId,
      vectorDocumentId: documentId,
      chunkCount: vectorDocument.chunks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add to prompt store for UI display
    promptStore.addKnowledgeEntry(knowledgeItem)
    console.log(`Added Drive file to knowledge base: ${fileName} (${vectorDocument.chunks.length} chunks with embeddings)`)

    return NextResponse.json({
      success: true,
      item: knowledgeItem,
      vectorStats: {
        chunks: vectorDocument.chunks.length,
        documentId: documentId
      }
    })
  } catch (error: any) {
    console.error('Error syncing file:', error)
    return NextResponse.json({
      error: error.message || 'Failed to sync file'
    }, { status: 500 })
  }
}