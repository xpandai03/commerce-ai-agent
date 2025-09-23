import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Database, Key, Globe, Bell } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-zinc-400 mt-2">Configure system preferences and integrations</p>
      </div>

      {/* Database Configuration */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-orange-500" />
          <h3 className="text-xl font-semibold">Database Configuration</h3>
          <Badge variant="outline" className="border-yellow-600/30 text-yellow-500">
            Not Connected
          </Badge>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Supabase URL</Label>
            <Input
              placeholder="https://your-project.supabase.co"
              className="bg-black border-zinc-800"
              disabled
            />
            <p className="text-xs text-zinc-500">Set via NEXT_PUBLIC_SUPABASE_URL environment variable</p>
          </div>
          <div className="space-y-2">
            <Label>Supabase Anon Key</Label>
            <Input
              type="password"
              placeholder="Your anonymous key"
              className="bg-black border-zinc-800"
              disabled
            />
            <p className="text-xs text-zinc-500">Set via NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" disabled>
            Connect Database
          </Button>
        </div>
      </Card>

      {/* API Configuration */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="h-5 w-5 text-orange-500" />
          <h3 className="text-xl font-semibold">API Configuration</h3>
          <Badge className="bg-green-600/20 text-green-500 border-green-600/30">
            Connected
          </Badge>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>OpenAI API Key</Label>
            <Input
              type="password"
              value="sk-proj-...RONe4KsA"
              className="bg-black border-zinc-800"
              disabled
            />
            <p className="text-xs text-zinc-500">Set via OPENAI_API_KEY environment variable</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Model</Label>
              <p className="text-sm text-zinc-400">GPT-4 Turbo</p>
            </div>
            <Badge className="bg-green-600/20 text-green-500">Active</Badge>
          </div>
        </div>
      </Card>

      {/* System Preferences */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-5 w-5 text-orange-500" />
          <h3 className="text-xl font-semibold">System Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Chat Logging</Label>
              <p className="text-sm text-zinc-400">Store chat conversations for analysis</p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-save Prompts</Label>
              <p className="text-sm text-zinc-400">Automatically save prompt changes</p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Analytics</Label>
              <p className="text-sm text-zinc-400">Track usage statistics</p>
            </div>
            <Switch disabled />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-orange-500" />
          <h3 className="text-xl font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-zinc-400">Receive system alerts via email</p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Error Alerts</Label>
              <p className="text-sm text-zinc-400">Get notified when errors occur</p>
            </div>
            <Switch disabled />
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4 mt-6">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Configuration Status</h4>
            <p className="text-sm text-zinc-400">
              Settings are currently read-only. Database integration and configuration management
              will be enabled in the next phase of development.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}