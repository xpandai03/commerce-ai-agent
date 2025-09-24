import OpenAI from 'openai'
import { encode } from 'gpt-3-encoder'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Document chunk interface
export interface DocumentChunk {
  id: string
  documentId: string
  documentName: string
  content: string
  embedding?: number[]
  metadata?: {
    pageNumber?: number
    section?: string
    source?: string
  }
}

// Vector store interface
export interface VectorDocument {
  id: string
  title: string
  chunks: DocumentChunk[]
  source: 'drive' | 'manual' | 'pdf'
  createdAt: string
}

// Global in-memory vector store
declare global {
  var vectorStore: Map<string, VectorDocument> | undefined
  var documentChunks: DocumentChunk[] | undefined
}

// Initialize vector store
if (!global.vectorStore) {
  global.vectorStore = new Map<string, VectorDocument>()
}

if (!global.documentChunks) {
  global.documentChunks = []
}

class VectorStore {
  private store: Map<string, VectorDocument>
  private chunks: DocumentChunk[]

  constructor() {
    this.store = global.vectorStore!
    this.chunks = global.documentChunks!
  }

  // Chunk text into smaller pieces (500 tokens max)
  chunkText(text: string, maxTokens: number = 500): string[] {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)

    let currentChunk = ''
    let currentTokens = 0

    for (const sentence of sentences) {
      const sentenceTokens = encode(sentence).length

      if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
        currentTokens = sentenceTokens
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence
        currentTokens += sentenceTokens
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    // If no sentences or very long text, fall back to token-based chunking
    if (chunks.length === 0 && text.length > 0) {
      const tokens = encode(text)
      for (let i = 0; i < tokens.length; i += maxTokens) {
        const chunkTokens = tokens.slice(i, i + maxTokens)
        const chunkText = chunkTokens.map(t => String.fromCharCode(t)).join('')
        chunks.push(chunkText)
      }
    }

    return chunks
  }

  // Generate embedding for text using OpenAI
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      })
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Return empty embedding on error
      return new Array(1536).fill(0)
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (normA * normB)
  }

  // Add document to vector store with embeddings
  async addDocument(
    documentId: string,
    title: string,
    content: string,
    source: 'drive' | 'manual' | 'pdf'
  ): Promise<VectorDocument> {
    console.log(`Adding document to vector store: ${title}`)

    // Chunk the content
    const textChunks = this.chunkText(content)
    console.log(`Document chunked into ${textChunks.length} pieces`)

    // Generate embeddings for each chunk
    const chunks: DocumentChunk[] = []

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i]
      const chunkId = `${documentId}_chunk_${i}`

      console.log(`Generating embedding for chunk ${i + 1}/${textChunks.length}`)
      const embedding = await this.generateEmbedding(chunkText)

      const chunk: DocumentChunk = {
        id: chunkId,
        documentId,
        documentName: title,
        content: chunkText,
        embedding,
        metadata: {
          pageNumber: Math.floor(i / 3) + 1, // Approximate page number
          source
        }
      }

      chunks.push(chunk)
      this.chunks.push(chunk)
    }

    const document: VectorDocument = {
      id: documentId,
      title,
      chunks,
      source,
      createdAt: new Date().toISOString()
    }

    this.store.set(documentId, document)
    console.log(`Document ${title} added with ${chunks.length} chunks`)

    return document
  }

  // Semantic search - find most relevant chunks for a query
  async search(query: string, topK: number = 5): Promise<Array<DocumentChunk & { score: number }>> {
    console.log(`Searching for: ${query}`)

    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query)

    // Calculate similarity scores for all chunks
    const scoredChunks = this.chunks
      .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
      .map(chunk => ({
        ...chunk,
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding!)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    console.log(`Found ${scoredChunks.length} relevant chunks`)
    console.log('Top scores:', scoredChunks.map(c => c.score))

    return scoredChunks
  }

  // Get all documents
  getAllDocuments(): VectorDocument[] {
    return Array.from(this.store.values())
  }

  // Get document by ID
  getDocument(documentId: string): VectorDocument | undefined {
    return this.store.get(documentId)
  }

  // Remove document
  removeDocument(documentId: string): boolean {
    // Remove chunks
    this.chunks = this.chunks.filter(chunk => chunk.documentId !== documentId)
    global.documentChunks = this.chunks

    // Remove document
    return this.store.delete(documentId)
  }

  // Get store statistics
  getStats() {
    return {
      documentCount: this.store.size,
      totalChunks: this.chunks.length,
      averageChunksPerDocument: this.store.size > 0 ? this.chunks.length / this.store.size : 0
    }
  }
}

// Export singleton instance
export const vectorStore = new VectorStore()