// PDF text extraction utility
// Uses a simple approach to extract text from PDFs without complex dependencies

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert buffer to string to analyze PDF structure
    const uint8Array = new Uint8Array(buffer)
    let pdfContent = ''

    // Convert to string, handling encoding
    for (let i = 0; i < uint8Array.length; i++) {
      pdfContent += String.fromCharCode(uint8Array[i])
    }

    // Extract text from PDF streams
    const extractedTexts: string[] = []

    // Method 1: Extract text between BT (Begin Text) and ET (End Text) operators
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || []

    for (const block of textBlocks) {
      // Extract text within parentheses (PDF text strings)
      const textMatches = block.match(/\(([^)]*)\)/g) || []

      for (const match of textMatches) {
        // Remove parentheses and decode
        let text = match.slice(1, -1)

        // Handle escaped characters in PDF
        text = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\')
          .replace(/\\(\d{3})/g, (match, octal) => {
            // Handle octal character codes
            return String.fromCharCode(parseInt(octal, 8))
          })

        if (text.trim().length > 0) {
          extractedTexts.push(text)
        }
      }

      // Also try to extract text from Tj/TJ operators (text show commands)
      const tjMatches = block.match(/\[(.*?)\]\s*TJ/g) || []
      for (const tjMatch of tjMatches) {
        const arrayContent = tjMatch.match(/\((.*?)\)/g) || []
        for (const item of arrayContent) {
          const text = item.slice(1, -1).trim()
          if (text.length > 0) {
            extractedTexts.push(text)
          }
        }
      }
    }

    // Method 2: Look for text in content streams
    const streamMatches = pdfContent.match(/stream([\s\S]*?)endstream/g) || []

    for (const stream of streamMatches) {
      // Remove stream/endstream markers
      const streamContent = stream.replace(/^stream\s*/, '').replace(/\s*endstream$/, '')

      // Try to extract readable text
      const readableText = streamContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep printable ASCII
        .replace(/\s+/g, ' ')
        .trim()

      // Look for sequences of readable words
      const words = readableText.match(/[a-zA-Z]{3,}/g) || []
      if (words.length > 5) {
        // If we found meaningful words, add them
        const sentence = words.join(' ')
        if (sentence.length > 20) {
          extractedTexts.push(sentence)
        }
      }
    }

    // Join all extracted text
    let finalText = extractedTexts.join(' ')

    // Clean up the text
    finalText = finalText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/(\w)([A-Z])/g, '$1 $2') // Add space between camelCase
      .trim()

    // If we couldn't extract much text, try a simpler approach
    if (finalText.length < 100) {
      // Extract any text between parentheses in the entire document
      const allParentheses = pdfContent.match(/\(([^)]+)\)/g) || []
      const simpleText = allParentheses
        .map(match => match.slice(1, -1))
        .filter(text => {
          // Keep only readable text
          const readable = text.replace(/[^\x20-\x7E]/g, '')
          return readable.length > 5 && /[a-zA-Z]/.test(readable)
        })
        .join(' ')

      if (simpleText.length > finalText.length) {
        finalText = simpleText
      }
    }

    return finalText || ''
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Alternative: For production use, consider using a PDF parsing service or API