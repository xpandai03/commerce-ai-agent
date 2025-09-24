'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BrainCircuit,
  Database,
  MessageSquare,
  Activity,
  Users,
  TrendingUp,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [knowledgeCount, setKnowledgeCount] = useState(0)

  useEffect(() => {
    // Fetch knowledge entries count from API
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        if (data.entries && Array.isArray(data.entries)) {
          setKnowledgeCount(data.entries.length)
        }
      })
      .catch(console.error)
  }, [])

  const stats = [
    {
      label: "Active Prompts",
      value: "1",
      change: "+0% from last week",
      icon: MessageSquare,
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Knowledge Entries",
      value: knowledgeCount.toString(),
      change: "Updated today",
      icon: Database,
      color: "bg-green-500",
      bgColor: "bg-green-50"
    },
    {
      label: "Response Time",
      value: "1.2s",
      change: "-15% improvement",
      icon: Zap,
      color: "bg-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      label: "System Health",
      value: "98%",
      change: "All systems operational",
      icon: Activity,
      color: "bg-orange-500",
      bgColor: "bg-orange-50"
    },
  ]

  const quickActions = [
    {
      href: "/admin/prompts",
      label: "System Prompts",
      description: "Customize AI personality and behavior",
      icon: BrainCircuit,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      href: "/admin/knowledge",
      label: "Knowledge Base",
      description: "Upload and manage treatment information",
      icon: Database,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      href: "/admin/settings",
      label: "Settings",
      description: "Configure system preferences",
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
  ]

  const recentActivity = [
    { time: "2 hours ago", action: "System prompt updated", status: "success" },
    { time: "5 hours ago", action: "Knowledge base document uploaded", status: "success" },
    { time: "1 day ago", action: "Configuration backup created", status: "info" },
    { time: "2 days ago", action: "API rate limit adjusted", status: "warning" },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your AI assistant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Quick Actions */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                      <div className={`p-3 rounded-lg ${action.bgColor}`}>
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                          {action.label}
                        </h4>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {activity.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />}
                    {activity.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                    {activity.status === 'info' && <Clock className="h-5 w-5 text-blue-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current operational metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Operational
                </Badge>
                <span className="text-sm font-medium text-gray-700">Chat Interface</span>
              </div>
              <span className="text-sm text-gray-500">Response time: 1.2s avg</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
                <span className="text-sm font-medium text-gray-700">OpenAI API</span>
              </div>
              <span className="text-sm text-gray-500">Model: GPT-4 Turbo</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Limited
                </Badge>
                <span className="text-sm font-medium text-gray-700">Database</span>
              </div>
              <span className="text-sm text-gray-500">Using in-memory storage</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">API Usage</span>
              <span className="font-medium text-gray-900">42%</span>
            </div>
            <Progress value={42} className="h-2" />
            <p className="text-xs text-gray-500">2,100 of 5,000 requests this month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}