"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Copy,
  Edit3,
  Eye,
  Save,
  RefreshCw,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  History,
  Code2
} from "lucide-react"
import { toast } from "sonner"

export default function PromptsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activePrompt, setActivePrompt] = useState<any>(null)

  const [editedPrompt, setEditedPrompt] = useState('')

  useEffect(() => {
    fetchActivePrompt()
  }, [])

  const fetchActivePrompt = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/prompts/active', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setActivePrompt(data)
        setEditedPrompt(data.content)
        console.log('Loaded prompt from:', data.source, 'ID:', data.id)
      } else {
        toast.error('Failed to fetch active prompt')
      }
    } catch (error) {
      console.error('Error fetching prompt:', error)
      toast.error('Error loading prompt')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (activePrompt) {
      navigator.clipboard.writeText(activePrompt.content || editedPrompt)
      toast.success("Prompt copied to clipboard")
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Use the simpler update endpoint
      const response = await fetch('/api/prompts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedPrompt,
          name: activePrompt?.name || 'Custom Emer Assistant'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActivePrompt(data)
        setEditedPrompt(data.content)

        // Show success message
        toast.success('Prompt saved! Changes will apply immediately to new chats.')

        // Refresh the active prompt to ensure it's updated
        await fetchActivePrompt()
      } else {
        const error = await response.json()
        toast.error(`Failed to save: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Error saving prompt')
    } finally {
      setIsLoading(false)
    }
  }

  const getPromptStats = (prompt: string) => ({
    characters: prompt.length,
    words: prompt.split(/\s+/).filter(word => word.length > 0).length,
    lines: prompt.split('\n').length,
    sections: prompt.split('\n\n').filter(section => section.trim().length > 0).length
  })

  const stats = getPromptStats(editedPrompt)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-50">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Prompts</h1>
            <p className="text-gray-500">Define your AI assistant's personality and behavior</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">Current Configuration</CardTitle>
              {activePrompt?.source === 'memory' ? (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Default
                </Badge>
              )}
            </div>
            <Button
              onClick={fetchActivePrompt}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Prompt Name</p>
              <p className="font-medium text-gray-900">{activePrompt?.name || 'Default Emer Assistant'}</p>
            </div>
            <div>
              <p className="text-gray-500">Version</p>
              <p className="font-medium text-gray-900">v{activePrompt?.version || '1.0'}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">
                {activePrompt?.updated_at ? new Date(activePrompt.updated_at).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="edit" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="view" className="gap-2">
            <Eye className="h-4 w-4" />
            View
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Code2 className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Current System Prompt</CardTitle>
                  <CardDescription>This is the active prompt being used by the AI assistant</CardDescription>
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Loading prompt...</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap text-gray-700 max-h-[500px] overflow-y-auto">
                  {activePrompt?.content || editedPrompt}
                </div>
              )}
              <Separator className="my-4" />
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{stats.characters.toLocaleString()} characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{stats.words.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{stats.lines} lines</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Edit System Prompt</CardTitle>
                  <CardDescription>Customize how your AI assistant responds to users</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditedPrompt(activePrompt?.content || '')}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={editedPrompt === activePrompt?.content || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editedPrompt !== activePrompt?.content && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    You have unsaved changes. Click "Save Changes" to apply them.
                  </AlertDescription>
                </Alert>
              )}
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[500px] font-mono text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                placeholder="Enter your system prompt here..."
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className={`flex items-center gap-2 ${editedPrompt.length > 4000 ? 'text-orange-600 font-medium' : ''}`}>
                    <FileText className="h-4 w-4" />
                    <span>{stats.characters.toLocaleString()} characters</span>
                    {editedPrompt.length > 4000 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Large prompt
                      </Badge>
                    )}
                  </div>
                  <span>{stats.words.toLocaleString()} words</span>
                  <span>{stats.lines} lines</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Formatted Preview</CardTitle>
                  <CardDescription>See how your prompt will be structured and presented</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Preview Mode
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 prose prose-gray max-w-none max-h-[500px] overflow-y-auto">
              {editedPrompt.split('\n\n').map((paragraph, index) => {
                if (paragraph.toUpperCase().startsWith('ABOUT') || paragraph.toUpperCase().startsWith('ACNE') ||
                    paragraph.toUpperCase().startsWith('COMBINATION') || paragraph.toUpperCase().startsWith('CONSULTATION') ||
                    paragraph.toUpperCase().startsWith('TONE')) {
                  return (
                    <h3 key={index} className="text-purple-700 font-semibold mt-4 mb-2 text-base">
                      {paragraph}
                    </h3>
                  )
                } else if (paragraph.startsWith('-') || paragraph.match(/^\d+\./)) {
                  return (
                    <ul key={index} className="list-disc list-inside space-y-1 ml-4">
                      {paragraph.split('\n').map((line, lineIndex) => (
                        <li key={lineIndex} className="text-gray-700">{line.replace(/^[-*]\s*/, '')}</li>
                      ))}
                    </ul>
                  )
                } else {
                  return (
                    <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                }
              })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Card */}
      <Alert className="border-purple-200 bg-purple-50">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-gray-700">
          <strong className="text-gray-900">Pro tip:</strong> Your system prompt defines how Emer responds to users.
          Include information about treatments, pricing, clinic details, and the desired tone of conversation.
          Changes take effect immediately for new chat sessions.
        </AlertDescription>
      </Alert>
    </div>
  )
}