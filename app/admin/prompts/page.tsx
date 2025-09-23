"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Copy, Edit, Eye, Save } from "lucide-react"
import { toast } from "sonner"

export default function PromptsPage() {
  const [isEditing, setIsEditing] = useState(false)

  // This is the current hardcoded prompt from the API
  const currentPrompt = `You are Emer, an AI assistant for Dr. Jason Emer's renowned aesthetic clinic specializing in advanced cosmetic treatments.

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

  const [editedPrompt, setEditedPrompt] = useState(currentPrompt)

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt)
    toast.success("Prompt copied to clipboard")
  }

  const handleSave = () => {
    // For now, just show a message - will connect to database later
    toast.info("Database integration coming soon - changes not saved")
    setIsEditing(false)
  }

  const getPromptStats = (prompt: string) => ({
    characters: prompt.length,
    words: prompt.split(/\s+/).filter(word => word.length > 0).length,
    lines: prompt.split('\n').length,
    sections: prompt.split('\n\n').filter(section => section.trim().length > 0).length
  })

  const stats = getPromptStats(editedPrompt)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">System Prompts</h2>
        <p className="text-zinc-400 mt-2">Manage and customize AI assistant behavior</p>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 mb-6">
        <Badge className="bg-green-600/20 text-green-500 border-green-600/30">
          Active Prompt: Default Emer Assistant
        </Badge>
        <Badge variant="outline" className="border-zinc-700">
          Version 1.0
        </Badge>
        <Badge variant="outline" className="border-zinc-700">
          Using: Hardcoded (DB not connected)
        </Badge>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Current System Prompt</h3>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="bg-zinc-800 border-zinc-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="bg-black rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-zinc-300">
              {currentPrompt}
            </div>
            <div className="flex gap-4 mt-4 text-sm text-zinc-500">
              <span>{stats.characters} characters</span>
              <span>•</span>
              <span>{stats.words} words</span>
              <span>•</span>
              <span>{stats.lines} lines</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit System Prompt</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditedPrompt(currentPrompt)}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 border-zinc-700"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={editedPrompt === currentPrompt}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="min-h-[500px] bg-black border-zinc-800 font-mono text-sm"
              placeholder="Enter your system prompt..."
            />
            <div className="flex gap-4 mt-4 text-sm text-zinc-500">
              <span className={editedPrompt.length > 4000 ? "text-orange-500" : ""}>
                {stats.characters} characters
              </span>
              <span>•</span>
              <span>{stats.words} words</span>
              <span>•</span>
              <span>{stats.lines} lines</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Formatted Preview</h3>
              <Badge variant="outline" className="border-zinc-700">
                Preview Mode
              </Badge>
            </div>
            <div className="bg-black rounded-lg p-6 prose prose-invert max-w-none">
              {editedPrompt.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('ABOUT') || paragraph.startsWith('ACNE') ||
                    paragraph.startsWith('COMBINATION') || paragraph.startsWith('CONSULTATION') ||
                    paragraph.startsWith('TONE:')) {
                  return (
                    <h3 key={index} className="text-orange-500 font-semibold mt-4 mb-2">
                      {paragraph}
                    </h3>
                  )
                } else if (paragraph.startsWith('-') || paragraph.match(/^\d+\./)) {
                  return (
                    <ul key={index} className="list-disc list-inside space-y-1">
                      {paragraph.split('\n').map((line, lineIndex) => (
                        <li key={lineIndex} className="text-zinc-300">{line.replace(/^-\s*/, '')}</li>
                      ))}
                    </ul>
                  )
                } else {
                  return (
                    <p key={index} className="text-zinc-300 mb-3">
                      {paragraph}
                    </p>
                  )
                }
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4 mt-6">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Preview Changes</h4>
            <p className="text-sm text-zinc-400">
              Changes are displayed in preview mode but not yet connected to the database.
              The chat is currently using the hardcoded prompt from the API route.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}