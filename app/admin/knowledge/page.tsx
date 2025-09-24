'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FolderIcon,
  FileTextIcon,
  Trash2Icon,
  PlusIcon,
  RefreshCwIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CloudIcon,
  LinkIcon,
  FileIcon,
  FolderOpenIcon,
  ArrowLeftIcon,
  Database
} from 'lucide-react'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: 'treatment' | 'product' | 'general' | 'pricing'
  source?: 'manual' | 'pdf' | 'drive'
  created_at?: string
  fileName?: string
  driveFileId?: string
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: string
  webViewLink?: string
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: 'general' as const
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  // Google Drive states
  const [driveStatus, setDriveStatus] = useState<{
    configured: boolean
    authenticated: boolean
    folderConnected: boolean
    folderUrl?: string
    folderName?: string
  }>({
    configured: false,
    authenticated: false,
    folderConnected: false
  })
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [selectedFolder, setSelectedFolder] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<{ id: string, name: string }[]>([])

  useEffect(() => {
    fetchKnowledgeItems()
    checkDriveStatus()
  }, [])

  const checkDriveStatus = async () => {
    try {
      const res = await fetch('/api/drive/status')
      if (res.ok) {
        const data = await res.json()
        setDriveStatus(data)
        if (data.folderUrl) {
          setSelectedFolder(data.folderUrl)
          // Load files from connected folder
          if (data.authenticated && data.folderConnected) {
            loadDriveFolder(data.folderUrl)
          }
        }
      }
    } catch (error) {
      console.error('Error checking drive status:', error)
    }
  }

  const loadDriveFolder = async (urlOrId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/drive/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderUrl: urlOrId })
      })

      if (res.ok) {
        const data = await res.json()
        setDriveFiles(data.files || [])
        setCurrentFolderId(data.folderId)

        // Update folder path if it's a new folder
        if (data.folderInfo) {
          if (folderPath.length === 0 || folderPath[folderPath.length - 1].id !== data.folderId) {
            setFolderPath([...folderPath, { id: data.folderId, name: data.folderInfo.name }])
          }
        }

        setMessage({ type: 'success', text: `Loaded ${data.files?.length || 0} files from folder` })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Failed to load folder' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading folder' })
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToFolder = async (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      await loadDriveFolder(file.id)
    }
  }

  const navigateBack = async () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1)
      const parentFolder = newPath[newPath.length - 1]
      setFolderPath(newPath)
      await loadDriveFolder(parentFolder.id)
    }
  }

  const connectDriveFolder = async () => {
    if (!selectedFolder) {
      setMessage({ type: 'error', text: 'Please enter a Google Drive folder URL' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/drive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderUrl: selectedFolder })
      })

      if (res.ok) {
        const data = await res.json()
        setDriveStatus(prev => ({
          ...prev,
          folderConnected: true,
          folderUrl: selectedFolder,
          folderName: data.folderName
        }))
        await loadDriveFolder(selectedFolder)
        setMessage({ type: 'success', text: 'Successfully connected to Google Drive folder' })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Failed to connect folder' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error connecting to folder' })
    } finally {
      setIsLoading(false)
    }
  }

  const syncDriveFile = async (file: DriveFile) => {
    setIsLoading(true)
    setUploadProgress(`Syncing ${file.name}...`)

    try {
      const res = await fetch('/api/drive/sync-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id, fileName: file.name, mimeType: file.mimeType })
      })

      if (res.ok) {
        const data = await res.json()
        await fetchKnowledgeItems()
        setMessage({ type: 'success', text: `Successfully synced ${file.name}` })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Failed to sync file' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error syncing file' })
    } finally {
      setIsLoading(false)
      setUploadProgress(null)
    }
  }

  const syncAllFiles = async () => {
    const syncableFiles = driveFiles.filter(f =>
      f.mimeType !== 'application/vnd.google-apps.folder' &&
      (f.mimeType === 'application/vnd.google-apps.document' ||
       f.mimeType === 'application/vnd.google-apps.spreadsheet' ||
       f.mimeType === 'application/pdf' ||
       f.mimeType?.startsWith('text/'))
    )

    if (syncableFiles.length === 0) {
      setMessage({ type: 'error', text: 'No syncable files found in this folder' })
      return
    }

    setIsLoading(true)
    let synced = 0

    for (const file of syncableFiles) {
      setUploadProgress(`Syncing ${synced + 1}/${syncableFiles.length}: ${file.name}`)
      try {
        const res = await fetch('/api/drive/sync-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: file.id, fileName: file.name, mimeType: file.mimeType })
        })
        if (res.ok) synced++
      } catch (error) {
        console.error(`Error syncing ${file.name}:`, error)
      }
    }

    await fetchKnowledgeItems()
    setMessage({ type: 'success', text: `Successfully synced ${synced} files` })
    setUploadProgress(null)
    setIsLoading(false)
  }

  const fetchKnowledgeItems = async () => {
    try {
      const res = await fetch('/api/knowledge')
      if (res.ok) {
        const data = await res.json()
        // Handle both old and new formats
        const entries = Array.isArray(data) ? data : (data.entries || [])
        const formattedItems = entries.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category || 'general',
          source: item.source,
          fileName: item.fileName,
          driveFileId: item.driveFileId,
          created_at: item.created_at
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching knowledge items:', error)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, source: 'manual' })
      })

      if (res.ok) {
        await fetchKnowledgeItems()
        setNewItem({ title: '', content: '', category: 'general' })
        setMessage({ type: 'success', text: 'Knowledge item added successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to add knowledge item' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding knowledge item' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' })

      if (res.ok) {
        await fetchKnowledgeItems()
        setMessage({ type: 'success', text: 'Item deleted successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to delete item' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting item' })
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return <FolderIcon className="h-4 w-4" />
    if (mimeType === 'application/vnd.google-apps.document') return <FileTextIcon className="h-4 w-4" />
    if (mimeType === 'application/pdf') return <FileTextIcon className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  const isSyncable = (mimeType: string) => {
    return mimeType !== 'application/vnd.google-apps.folder' &&
           (mimeType === 'application/vnd.google-apps.document' ||
            mimeType === 'application/vnd.google-apps.spreadsheet' ||
            mimeType === 'application/pdf' ||
            mimeType?.startsWith('text/'))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Base Management
            </span>
            {driveStatus.authenticated && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Google Drive Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage AI knowledge through Google Drive sync or manual entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-200' : 'border-green-200'}`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="drive" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="drive">Google Drive</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="items">Knowledge Items ({items.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="drive" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Google Drive Folder URL or ID</Label>
                    <Input
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste the URL of your Google Drive folder or enter its ID
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={connectDriveFolder}
                      disabled={isLoading || !selectedFolder}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Folder
                    </Button>
                  </div>
                </div>

                {currentFolderId && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {folderPath.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={navigateBack}
                            >
                              <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <h3 className="font-semibold">
                            {folderPath.length > 0 ? folderPath[folderPath.length - 1].name : 'Drive Files'}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadDriveFolder(currentFolderId)}
                            disabled={isLoading}
                          >
                            <RefreshCwIcon className="h-4 w-4 mr-1" />
                            Refresh
                          </Button>
                          <Button
                            size="sm"
                            onClick={syncAllFiles}
                            disabled={isLoading}
                          >
                            <CloudIcon className="h-4 w-4 mr-1" />
                            Sync All Files
                          </Button>
                        </div>
                      </div>

                      {uploadProgress && (
                        <Alert>
                          <AlertDescription>{uploadProgress}</AlertDescription>
                        </Alert>
                      )}

                      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                        {driveFiles.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No files found in this folder
                          </div>
                        ) : (
                          driveFiles.map((file) => (
                            <div
                              key={file.id}
                              className="p-3 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div
                                className={`flex items-center gap-2 flex-1 ${
                                  file.mimeType === 'application/vnd.google-apps.folder'
                                    ? 'cursor-pointer hover:text-blue-600'
                                    : ''
                                }`}
                                onClick={() => file.mimeType === 'application/vnd.google-apps.folder' && navigateToFolder(file)}
                              >
                                {getFileIcon(file.mimeType)}
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {file.webViewLink && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(file.webViewLink, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                                {isSyncable(file.mimeType) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => syncDriveFile(file)}
                                    disabled={isLoading}
                                  >
                                    <CloudIcon className="h-3 w-3 mr-1" />
                                    Sync
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="e.g., Morpheus8 Treatment Details"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="treatment">Treatment</option>
                    <option value="product">Product</option>
                    <option value="pricing">Pricing</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    placeholder="Enter detailed information..."
                    className="mt-1 h-32"
                  />
                </div>
                <Button onClick={handleAddItem} disabled={isLoading}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Knowledge Item
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="space-y-4">
                {items.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-gray-500">
                      No knowledge items yet. Add items manually or sync from Google Drive.
                    </CardContent>
                  </Card>
                ) : (
                  items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{item.category}</Badge>
                              {item.source && (
                                <Badge variant="secondary">
                                  {item.source === 'drive' ? 'Google Drive' : item.source}
                                </Badge>
                              )}
                              {item.fileName && (
                                <span className="text-xs text-gray-500">
                                  {item.fileName}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                          {item.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}