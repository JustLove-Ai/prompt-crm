import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MessageSquare, Star } from 'lucide-react'
import Link from 'next/link'
import { getPrompts } from '@/lib/actions/prompts'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { PromptsClient } from './prompts-client'

interface Prompt {
  id: string
  title: string
  content: string
  instructions?: string
  promptType: string
  category?: {
    id: string
    name: string
    color: string
  }
  tags: {
    tag: {
      id: string
      name: string
      color: string
    }
  }[]
  sampleOutputs: Array<{ id: string; title?: string }>
  isFavorite: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export default async function PromptsPage() {
  const [promptsResult, categoriesResult, tagsResult] = await Promise.all([
    getPrompts(),
    getCategories(),
    getTags()
  ])

  const prompts = promptsResult.success ? promptsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const tags = tagsResult.success ? tagsResult.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            Manage and organize your AI prompts
          </p>
        </div>
        <Button asChild>
          <Link href="/prompts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prompts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prompts.filter(p => p.isFavorite).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Prompts</CardTitle>
          <CardDescription>
            Browse, filter, and manage your prompt collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptsClient 
            prompts={prompts} 
            categories={categories} 
            tags={tags}
          />
        </CardContent>
      </Card>
    </div>
  )
}