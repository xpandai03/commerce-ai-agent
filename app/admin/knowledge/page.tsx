"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, Edit, Plus, Search, Trash2, Tag } from "lucide-react"
import { toast } from "sonner"

interface KnowledgeEntry {
  id: string
  category: string
  title: string
  content: string
  tags: string[]
  isActive: boolean
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Sample data - will be replaced with database data
  const [entries, setEntries] = useState<KnowledgeEntry[]>([
    {
      id: "1",
      category: "Treatments",
      title: "Laser Resurfacing Details",
      content: "CO2 laser resurfacing is our most aggressive treatment for deep acne scars. It works by removing the outer layers of damaged skin and stimulating collagen production. Recovery typically takes 5-7 days with redness lasting up to 2 weeks. Results continue to improve for 6 months post-treatment.",
      tags: ["laser", "co2", "acne scars", "resurfacing"],
      isActive: true
    },
    {
      id: "2",
      category: "Pricing",
      title: "Package Deals",
      content: "We offer combination treatment packages with 10-15% discounts. Popular packages include: Acne Scar Transformation (3 laser + 3 PRP sessions) for $4500, and Complete Skin Renewal (2 laser + 4 chemical peels) for $2800.",
      tags: ["pricing", "packages", "discounts"],
      isActive: true
    },
    {
      id: "3",
      category: "FAQs",
      title: "Recovery Time",
      content: "Recovery time varies by treatment: Laser resurfacing (5-7 days), Microneedling with PRP (1-2 days), Chemical peels (3-7 days), Subcision (minimal), Dermal fillers (no downtime).",
      tags: ["recovery", "downtime", "faq"],
      isActive: true
    }
  ])

  const [newEntry, setNewEntry] = useState<Partial<KnowledgeEntry>>({
    category: "Treatments",
    title: "",
    content: "",
    tags: [],
    isActive: true
  })

  const categories = ["Treatments", "Pricing", "FAQs", "Procedures", "Aftercare"]

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      toast.error("Please fill in all required fields")
      return
    }

    const entry: KnowledgeEntry = {
      id: Date.now().toString(),
      category: newEntry.category || "Treatments",
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags || [],
      isActive: true
    }

    setEntries([...entries, entry])
    toast.success("Knowledge entry added (not saved to database yet)")
    setIsAddDialogOpen(false)
    setNewEntry({
      category: "Treatments",
      title: "",
      content: "",
      tags: [],
      isActive: true
    })
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id))
    toast.success("Entry deleted (not saved to database yet)")
  }

  const handleToggleActive = (id: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, isActive: !entry.isActive } : entry
    ))
    toast.success("Entry status updated (not saved to database yet)")
  }

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setNewEntry({ ...newEntry, tags })
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Knowledge Base</h2>
        <p className="text-zinc-400 mt-2">Manage treatment information, FAQs, and pricing</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-zinc-400">Total Entries</p>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-zinc-400">Categories</p>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-green-500" />
            <div>
              <p className="text-2xl font-bold">{entries.filter(e => e.isActive).length}</p>
              <p className="text-sm text-zinc-400">Active</p>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-zinc-500" />
            <div>
              <p className="text-2xl font-bold">{entries.filter(e => !e.isActive).length}</p>
              <p className="text-sm text-zinc-400">Inactive</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Add Knowledge Entry</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new piece of information to the knowledge base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newEntry.category}
                  onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
                >
                  <SelectTrigger className="bg-black border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="bg-black border-zinc-800"
                  placeholder="e.g., Laser Treatment Details"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="min-h-[150px] bg-black border-zinc-800"
                  placeholder="Enter the knowledge content..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={newEntry.tags?.join(', ')}
                  onChange={(e) => handleTagInput(e.target.value)}
                  className="bg-black border-zinc-800"
                  placeholder="e.g., laser, treatment, recovery"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="bg-zinc-800 border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEntry}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Knowledge Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} className="border-zinc-800">
                <TableCell>
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-sm text-zinc-400 line-clamp-1">{entry.content}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-zinc-700">
                    {entry.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map(tag => (
                      <Badge key={tag} className="bg-zinc-800 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(entry.id)}
                    className={entry.isActive ? "text-green-500" : "text-zinc-500"}
                  >
                    {entry.isActive ? "Active" : "Inactive"}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Info Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4 mt-6">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Knowledge Base Status</h4>
            <p className="text-sm text-zinc-400">
              The knowledge base is currently displaying sample data. Database integration is coming soon.
              Once connected, the AI assistant will reference this information when answering questions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}