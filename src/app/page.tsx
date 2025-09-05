import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, FolderOpen, Tags, Star, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getPrompts } from '@/lib/actions/prompts'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'

interface DashboardStats {
  totalPrompts: number
  totalCategories: number
  totalTags: number
  totalFavorites: number
}

interface RecentPrompt {
  id: string
  title: string
  promptType: string
  createdAt: string
}

export default async function Dashboard() {
  // Fetch data using server actions
  const [promptsResult, categoriesResult, tagsResult] = await Promise.all([
    getPrompts(),
    getCategories(),
    getTags()
  ])

  const prompts = promptsResult.success ? promptsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const tags = tagsResult.success ? tagsResult.data : []

  // Calculate stats
  const favorites = prompts.filter((p) => p.isFavorite).length
  const recent = prompts
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      promptType: p.promptType,
      createdAt: new Date(p.createdAt).toLocaleDateString()
    }))

  const stats: DashboardStats = {
    totalPrompts: prompts.length,
    totalCategories: categories.length,
    totalTags: tags.length,
    totalFavorites: favorites
  }

  const recentPrompts: RecentPrompt[] = recent

  const statsConfig = [
    {
      title: "Total Prompts",
      value: stats.totalPrompts.toString(),
      description: "All prompts in your CRM",
      icon: MessageSquare,
      color: "bg-blue-500"
    },
    {
      title: "Categories",
      value: stats.totalCategories.toString(),
      description: "Organization categories",
      icon: FolderOpen,
      color: "bg-green-500"
    },
    {
      title: "Tags",
      value: stats.totalTags.toString(),
      description: "Labeling tags",
      icon: Tags,
      color: "bg-purple-500"
    },
    {
      title: "Favorites",
      value: stats.totalFavorites.toString(),
      description: "Starred prompts",
      icon: Star,
      color: "bg-yellow-500"
    }
  ]
  const quickActions = [
    { title: "Create New Prompt", href: "/prompts/new", icon: MessageSquare },
    { title: "Add Category", href: "/categories/new", icon: FolderOpen },
    { title: "Manage Tags", href: "/tags", icon: Tags },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Prompt CRM</h1>
        <p className="text-muted-foreground">
          Manage and organize your AI prompts efficiently
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-full ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={action.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {action.title}
                  </Link>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Prompts</CardTitle>
            <CardDescription>
              Your latest prompt activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPrompts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No prompts yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first prompt.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/prompts/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Prompt
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrompts.map((prompt) => (
                  <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                    <div className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <Badge variant="secondary">{prompt.promptType}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{prompt.title}</p>
                        <p className="text-xs text-gray-500">{prompt.createdAt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
