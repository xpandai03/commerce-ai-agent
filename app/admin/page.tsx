import { Card } from "@/components/ui/card"
import { Brain, Database, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    { label: "Active Prompts", value: "1", icon: MessageSquare, color: "text-blue-500" },
    { label: "Knowledge Entries", value: "3", icon: Database, color: "text-green-500" },
    { label: "Prompt Versions", value: "1", icon: Brain, color: "text-purple-500" },
    { label: "System Status", value: "Active", icon: Settings, color: "text-orange-500" },
  ]

  const quickActions = [
    { href: "/admin/prompts", label: "Edit System Prompt", description: "Modify AI behavior and responses" },
    { href: "/admin/knowledge", label: "Manage Knowledge", description: "Update treatment information and FAQs" },
    { href: "/admin/settings", label: "Configure Settings", description: "Manage system preferences" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-zinc-400 mt-2">Manage your AI assistant configuration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="bg-zinc-900 border-zinc-800 p-6 hover:bg-zinc-800 transition-colors cursor-pointer">
                <h4 className="font-semibold mb-2">{action.label}</h4>
                <p className="text-sm text-zinc-400">{action.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Info */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Chat Status</span>
            <span className="text-green-500">Online</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Database Connection</span>
            <span className="text-yellow-500">Not Configured</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">API Status</span>
            <span className="text-green-500">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Last Updated</span>
            <span>Just now</span>
          </div>
        </div>
      </Card>
    </div>
  )
}