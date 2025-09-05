import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Tags as TagsIcon } from 'lucide-react'
import Link from 'next/link'
import { getTags } from '@/lib/actions/tags'
import { TagsClient } from './tags-client'

interface Tag {
  id: string
  name: string
  color: string
  prompts?: Array<{ id: string; prompt: { title: string } }>
  createdAt: Date
  updatedAt: Date
}

export default async function TagsPage() {
  const result = await getTags()
  const tags = result.success ? result.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Label and organize your prompts with tags
          </p>
        </div>
        <Button asChild>
          <Link href="/tags/new">
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Tags</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.filter(t => t.prompts && t.prompts.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unused Tags</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.filter(t => !t.prompts || t.prompts.length === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
          <CardDescription>
            Manage your prompt tags and their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagsClient tags={tags} />
        </CardContent>
      </Card>
    </div>
  )
}