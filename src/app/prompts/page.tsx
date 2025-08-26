'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Filters } from '@/components/ui/filters'
import { Plus, MessageSquare, Star, Copy, FileDown } from 'lucide-react'
import Link from 'next/link'

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
  sampleOutputs: any[]
  isFavorite: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
  color: string
}

const promptTypes = [
  'CODE',
  'IMAGE', 
  'BUSINESS',
  'TECHNICAL',
  'CREATIVE',
  'ANALYSIS',
  'MARKETING',
  'OTHER'
]

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    fetchPrompts()
    fetchCategories()
    fetchTags()
  }, [])

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts')
      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    window.location.href = `/prompts/${prompt.id}/edit`
  }

  const handleDelete = async (prompt: Prompt) => {
    if (confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      try {
        const response = await fetch(`/api/prompts/${prompt.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchPrompts()
        }
      } catch (error) {
        console.error('Failed to delete prompt:', error)
      }
    }
  }

  const handleView = (prompt: Prompt) => {
    window.location.href = `/prompts/${prompt.id}`
  }

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchPrompts()
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  // Filtered prompts based on search and filters
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // Search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch = 
          prompt.title.toLowerCase().includes(search) ||
          prompt.content.toLowerCase().includes(search) ||
          (prompt.instructions && prompt.instructions.toLowerCase().includes(search))
        
        if (!matchesSearch) return false
      }

      // Type filter
      if (selectedType !== 'all' && prompt.promptType !== selectedType) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'uncategorized' && prompt.category) {
          return false
        }
        if (selectedCategory !== 'uncategorized' && prompt.category?.id !== selectedCategory) {
          return false
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const promptTagIds = prompt.tags.map(tagItem => tagItem.tag.id)
        const hasSelectedTag = selectedTags.some(tagId => promptTagIds.includes(tagId))
        if (!hasSelectedTag) return false
      }

      // Favorites filter
      if (showFavoritesOnly && !prompt.isFavorite) {
        return false
      }

      return true
    })
  }, [prompts, searchTerm, selectedType, selectedCategory, selectedTags, showFavoritesOnly])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedType('all')
    setSelectedCategory('all')
    setSelectedTags([])
    setShowFavoritesOnly(false)
  }

  // Count active filters
  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedType !== 'all' ? 1 : 0,
    selectedCategory !== 'all' ? 1 : 0,
    selectedTags.length,
    showFavoritesOnly ? 1 : 0
  ].reduce((acc, count) => acc + count, 0)

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: Prompt) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{value}</span>
              {row.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            <div className="text-sm text-muted-foreground truncate max-w-md">
              {row.content.substring(0, 80)}...
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'promptType',
      label: 'Type',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: any) => value ? (
        <div className="flex items-center space-x-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: value.color }}
          />
          <Badge variant="secondary">{value.name}</Badge>
        </div>
      ) : '-'
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((tagItem) => (
            <Badge 
              key={tagItem.tag.id}
              variant="outline"
              style={{ 
                backgroundColor: `${tagItem.tag.color}20`, 
                color: tagItem.tag.color, 
                borderColor: tagItem.tag.color 
              }}
            >
              {tagItem.tag.name}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline">+{value.length - 3}</Badge>
          )}
        </div>
      )
    },
    {
      key: 'sampleOutputs',
      label: 'Samples',
      render: (value: any[]) => (
        <Badge variant="secondary">
          {value.length}
        </Badge>
      )
    },
    {
      key: 'usageCount',
      label: 'Used',
      render: (value: number) => (
        <Badge variant="outline">{value}x</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            Manage your AI prompts with instructions and sample outputs
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/exports/new">
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Link>
          </Button>
          <Button asChild>
            <Link href="/prompts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
        categories={categories}
        tags={tags}
        promptTypes={promptTypes}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {activeFiltersCount > 0 ? 'Filtered' : 'Total'} Prompts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPrompts.length}
              {activeFiltersCount > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  of {prompts.length}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPrompts.filter(p => p.isFavorite).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Samples</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPrompts.filter(p => p.sampleOutputs.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...filteredPrompts.map(p => p.usageCount), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Prompts</CardTitle>
          <CardDescription>
            Manage your prompt library with instructions and examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredPrompts}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleView}
            onView={handleView}
          />
        </CardContent>
      </Card>
    </div>
  )
}