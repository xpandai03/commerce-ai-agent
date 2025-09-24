import { NextRequest, NextResponse } from 'next/server'
import { vectorStore } from '@/lib/vector-store'

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Check if we have documents in the vector store
    const stats = vectorStore.getStats()
    if (stats.documentCount === 0) {
      console.log('No documents in vector store for RAG search')
      return NextResponse.json({
        results: [],
        message: 'No documents available for search'
      })
    }

    console.log(`RAG Search: "${query}" (top ${topK} results from ${stats.totalChunks} chunks)`)

    // Perform semantic search
    const searchResults = await vectorStore.search(query, topK)

    // Format results for the chat system
    const formattedResults = searchResults.map(result => ({
      content: result.content,
      documentName: result.documentName,
      score: result.score,
      metadata: result.metadata
    }))

    console.log(`RAG Search found ${formattedResults.length} relevant chunks`)

    return NextResponse.json({
      results: formattedResults,
      stats: {
        totalDocuments: stats.documentCount,
        totalChunks: stats.totalChunks,
        resultsFound: formattedResults.length
      }
    })
  } catch (error: any) {
    console.error('RAG search error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to perform RAG search'
    }, { status: 500 })
  }
}

export async function GET() {
  // Return vector store statistics
  const stats = vectorStore.getStats()
  const documents = vectorStore.getAllDocuments()

  return NextResponse.json({
    stats,
    documents: documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      chunkCount: doc.chunks.length,
      source: doc.source,
      createdAt: doc.createdAt
    }))
  })
}