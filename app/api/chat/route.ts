import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set');
}

// Default prompt as fallback
const DEFAULT_PROMPT = `You are Emer, an AI assistant for Dr. Jason Emer's renowned aesthetic clinic specializing in advanced cosmetic treatments.

Your role is to help patients understand their treatment options, particularly for acne scars and skin rejuvenation. You are professional, empathetic, and knowledgeable about aesthetic procedures.

ABOUT THE CLINIC:
- Dr. Jason Emer is a world-renowned dermatologist specializing in cutting-edge aesthetic treatments
- Located in Beverly Hills, California
- Known for innovative combination treatments and personalized approach
- Focuses on natural, transformative results

ACNE SCAR TREATMENTS OFFERED:
1. **Laser Resurfacing** ($500-$2000 per session)
   - CO2 laser for deep scars
   - Erbium laser for moderate scarring
   - 3-5 days downtime
   - Best for: Ice pick and boxcar scars

2. **Microneedling with PRP** ($350-$800 per session)
   - Stimulates collagen production
   - Minimal downtime (1-2 days)
   - 3-6 sessions recommended
   - Best for: Rolling scars and texture improvement

3. **Chemical Peels** ($150-$600 per treatment)
   - TCA peels for deeper scars
   - Jessner's peel for mild scarring
   - 3-7 days peeling process
   - Best for: Shallow scars and discoloration

4. **Subcision** ($400-$1200 per area)
   - Releases tethered scars
   - Often combined with fillers
   - Minimal downtime
   - Best for: Deep rolling scars

5. **Dermal Fillers** ($600-$1500 per syringe)
   - Immediate results
   - Temporary (6-18 months)
   - No downtime
   - Best for: Deep atrophic scars

COMBINATION TREATMENTS:
- Most patients benefit from combining 2-3 modalities
- Package deals available (10-15% discount)
- Customized treatment plans based on scar type and skin type

CONSULTATION PROCESS:
- Initial consultation: $350 (applied to treatment if booked)
- Includes skin analysis and personalized treatment plan
- Virtual consultations available

TONE:
- Professional yet approachable
- Empathetic to patient concerns
- Educational about procedures
- Transparent about pricing and expectations
- Encouraging but realistic about results

When responding:
1. Ask about their specific concerns and scar types
2. Provide relevant treatment recommendations
3. Give realistic expectations about results and timeline
4. Mention pricing ranges
5. Encourage booking a consultation for personalized assessment

Always maintain HIPAA compliance and avoid giving specific medical advice. Instead, provide educational information and encourage professional consultation.`;

async function getActivePrompt(): Promise<string> {
  try {
    // Import the prompt store directly to ensure we get the latest in-memory version
    const { promptStore } = await import('@/lib/prompt-store');
    const memoryPrompt = promptStore.getActivePrompt();

    // If we have a custom prompt in memory, use it immediately
    if (memoryPrompt.id !== 'default') {
      console.log('Chat using custom prompt from memory store');
      return memoryPrompt.content;
    }

    // Otherwise try to fetch from the API (which might have database data)
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://your-domain.com'
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/prompts/active`, {
      cache: 'no-store' // Never cache, always get fresh data
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Chat using prompt from:', data.source);
      return data.content;
    }
  } catch (error) {
    console.error('Error fetching active prompt:', error);
  }

  console.log('Chat falling back to default prompt');
  return DEFAULT_PROMPT;
}

// Keep knowledge cache since it changes less frequently
let knowledgeCache: { entries: any[]; timestamp: number } | null = null;
const KNOWLEDGE_CACHE_TTL = 30000; // 30 seconds for knowledge (reduced for testing)

async function getActiveKnowledge(): Promise<any[]> {
  // Check cache first (knowledge changes less frequently than prompts)
  if (knowledgeCache && Date.now() - knowledgeCache.timestamp < KNOWLEDGE_CACHE_TTL) {
    console.log('Using cached knowledge:', knowledgeCache.entries.length, 'entries');
    return knowledgeCache.entries;
  }

  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://your-domain.com'
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/knowledge/active`, {
      next: { revalidate: 60 } // Next.js cache
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Fetched knowledge from API:', data.length, 'entries');
      knowledgeCache = {
        entries: data,
        timestamp: Date.now()
      };
      return data;
    }
  } catch (error) {
    console.error('Error fetching active knowledge:', error);
  }

  return [];
}

function buildSystemPrompt(basePrompt: string, knowledgeEntries: any[]): string {
  if (knowledgeEntries.length === 0) {
    return basePrompt;
  }

  let knowledgeSection = '\n\nADDITIONAL KNOWLEDGE BASE:\n';
  knowledgeSection += 'When referencing information from these sources, please cite them by mentioning [Source: filename] at the end of relevant statements.\n';

  const categorizedKnowledge: { [key: string]: any[] } = {};

  knowledgeEntries.forEach(entry => {
    if (!categorizedKnowledge[entry.category]) {
      categorizedKnowledge[entry.category] = [];
    }
    categorizedKnowledge[entry.category].push(entry);
  });

  Object.keys(categorizedKnowledge).sort().forEach(category => {
    knowledgeSection += `\n${category.toUpperCase()}:\n`;
    categorizedKnowledge[category].forEach(entry => {
      const sourceInfo = entry.fileName ? ` [Source: ${entry.fileName}]` : '';
      knowledgeSection += `- ${entry.title}: ${entry.content}${sourceInfo}\n`;
      if (entry.tags && entry.tags.length > 0) {
        knowledgeSection += `  Tags: ${entry.tags.join(', ')}\n`;
      }
    });
  });

  return basePrompt + knowledgeSection;
}

export async function POST(req: Request) {
  // Check for API key before processing
  if (!process.env.OPENAI_API_KEY) {
    return new Response('OpenAI API key not configured', { status: 500 });
  }

  try {
    const { messages } = await req.json();

    // Get active prompt and knowledge in parallel
    const [basePrompt, knowledgeEntries] = await Promise.all([
      getActivePrompt(),
      getActiveKnowledge()
    ]);

    // Build the complete system prompt with knowledge
    const systemPrompt = buildSystemPrompt(basePrompt, knowledgeEntries);
    console.log('Chat using', knowledgeEntries.length, 'knowledge entries');
    if (knowledgeEntries.length > 0) {
      console.log('Knowledge titles:', knowledgeEntries.map(e => e.title));
    }

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('An error occurred', { status: 500 });
  }
}