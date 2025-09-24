// In-memory storage for prompts (since we don't have a database)
// This will persist during the server session

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

Always maintain HIPAA compliance and avoid giving specific medical advice. Instead, provide educational information and encourage professional consultation.`

class PromptStore {
  private activePrompt: {
    id: string
    name: string
    content: string
    is_active: boolean
    version: number
    updated_at: string
  } | null = null

  private knowledgeEntries: any[] = []

  getActivePrompt() {
    if (this.activePrompt) {
      return {
        ...this.activePrompt,
        source: 'memory'
      }
    }

    return {
      id: 'default',
      name: 'Default Emer Assistant',
      content: DEFAULT_PROMPT,
      is_active: true,
      version: 1,
      source: 'hardcoded'
    }
  }

  setActivePrompt(prompt: any) {
    this.activePrompt = {
      ...prompt,
      updated_at: new Date().toISOString()
    }
    console.log('Prompt updated in memory store')
  }

  getKnowledgeEntries() {
    return this.knowledgeEntries
  }

  addKnowledgeEntry(entry: any) {
    // Don't override the ID if it already exists, ensure uniqueness
    const newEntry = {
      ...entry,
      id: entry.id || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || new Date().toISOString()
    }
    this.knowledgeEntries.push(newEntry)
  }

  updateKnowledgeEntry(id: string, updates: any) {
    const index = this.knowledgeEntries.findIndex(e => e.id === id)
    if (index !== -1) {
      this.knowledgeEntries[index] = {
        ...this.knowledgeEntries[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
    }
  }

  deleteKnowledgeEntry(id: string) {
    this.knowledgeEntries = this.knowledgeEntries.filter(e => e.id !== id)
  }
}

// Create a singleton instance - using globalThis to ensure it persists across API calls
const globalForPromptStore = globalThis as unknown as {
  promptStore: PromptStore | undefined
}

if (!globalForPromptStore.promptStore) {
  globalForPromptStore.promptStore = new PromptStore()
}

export const promptStore = globalForPromptStore.promptStore
export { DEFAULT_PROMPT }