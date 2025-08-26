'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Filters } from '@/components/ui/filters'
import { SelectableDataTable } from '@/components/ui/selectable-data-table'
import { ArrowLeft, FileDown, Star, Calendar, Copy } from 'lucide-react'
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

export default function ExportSelectionPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set())
  
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


  const selectAll = () => {
    setSelectedPrompts(new Set(filteredPrompts.map(p => p.id)))
  }

  const selectNone = () => {
    setSelectedPrompts(new Set())
  }

  const createEbook = async () => {
    if (selectedPrompts.size === 0) {
      alert('Please select at least one prompt to export')
      return
    }

    try {
      const { createEbookExport } = await import('@/lib/ebook-actions')
      const result = await createEbookExport(Array.from(selectedPrompts))

      if (result.success && result.data) {
        window.location.href = `/exports/${result.data.id}/edit`
      } else {
        alert(result.error || 'Failed to create ebook. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create ebook:', error)
      alert('Failed to create ebook. Please try again.')
    }
  }

  const handlePromptView = (prompt: Prompt) => {
    window.location.href = `/prompts/${prompt.id}`
  }

  const copyPrompt = async (prompt: Prompt, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      let copyText = prompt.content
      if (prompt.instructions) {
        copyText = `Instructions:\n${prompt.instructions}\n\nPrompt:\n${prompt.content}`
      }
      await navigator.clipboard.writeText(copyText)
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  // Define columns for the data table
  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: Prompt) => (
        <div className="max-w-md">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium">{value}</span>
            {row.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {row.content.substring(0, 80)}...
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
      ) : (
        <span className="text-muted-foreground text-sm">None</span>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((tagItem) => (
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
          {value.length > 2 && (
            <Badge variant="outline">+{value.length - 2}</Badge>
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
      render: (value: Date) => (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Prompt) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => copyPrompt(row, e)}
          className="h-8 w-8 p-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prompts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Export to PDF</h1>
            <p className="text-muted-foreground">
              Select prompts to include in your ebook
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedPrompts.size} selected
          </Badge>
          <Button 
            onClick={createEbook}
            disabled={selectedPrompts.size === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Create Ebook
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

      {/* Selection Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Selection Controls</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All ({filteredPrompts.length})
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Select None
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Select Prompts</CardTitle>
          <CardDescription>
            Choose the prompts you want to include in your ebook. Click rows to view details, use checkboxes to select.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectableDataTable
            columns={columns}
            data={filteredPrompts}
            selectedIds={selectedPrompts}
            onSelectionChange={setSelectedPrompts}
            onRowClick={handlePromptView}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Selected Prompts Summary */}
      {selectedPrompts.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Selected Prompts</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPrompts.size} prompt{selectedPrompts.size !== 1 ? 's' : ''} ready for export
                </p>
              </div>
              <Button onClick={createEbook}>
                <FileDown className="mr-2 h-4 w-4" />
                Create Ebook
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}