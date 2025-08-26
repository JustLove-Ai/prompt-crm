'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, Tags as TagsIcon } from 'lucide-react'
import Link from 'next/link'

interface Tag {
  id: string
  name: string
  color: string
  prompts?: any[]
  createdAt: Date
  updatedAt: Date
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tag: Tag) => {
    window.location.href = `/tags/${tag.id}/edit`
  }

  const handleDelete = async (tag: Tag) => {
    if (confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      try {
        const response = await fetch(`/api/tags/${tag.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchTags()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to delete tag')
        }
      } catch (error) {
        console.error('Failed to delete tag:', error)
        alert('Failed to delete tag')
      }
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, row: Tag) => (
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            style={{ backgroundColor: `${row.color}20`, color: row.color, borderColor: row.color }}
          >
            {value}
          </Badge>
        </div>
      )
    },
    {
      key: 'color',
      label: 'Color',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <div 
            className="h-4 w-4 rounded-full border" 
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-muted-foreground">{value}</span>
        </div>
      )
    },
    {
      key: 'prompts',
      label: 'Used in Prompts',
      render: (value: any[]) => (
        <Badge variant="outline">
          {value?.length || 0} prompts
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: Date) => new Date(value).toLocaleDateString()
    }
  ]

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
          <DataTable
            columns={columns}
            data={tags}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  )
}