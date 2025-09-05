'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { deletePrompt, togglePromptFavorite } from '@/lib/actions/prompts'
import { useRouter } from 'next/navigation'

interface Prompt {
  id: string
  title: string
  content: string
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
  isFavorite: boolean
  createdAt: Date
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

interface PromptsClientProps {
  prompts: Prompt[]
  categories: Category[]
  tags: Tag[]
}

export function PromptsClient({ prompts }: PromptsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEdit = (prompt: Prompt) => {
    router.push(`/prompts/${prompt.id}/edit`)
  }

  const handleDelete = async (prompt: Prompt) => {
    if (confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      setLoading(true)
      const result = await deletePrompt(prompt.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete prompt')
      }
      setLoading(false)
    }
  }

  const toggleFavorite = async (prompt: Prompt) => {
    setLoading(true)
    const result = await togglePromptFavorite(prompt.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to update favorite status')
    }
    setLoading(false)
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: Prompt) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{value}</span>
            {row.isFavorite && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {row.content.slice(0, 100)}...
          </p>
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
      render: (value: Prompt['category']) => value ? (
        <Badge 
          variant="outline"
          style={{ borderColor: value.color, color: value.color }}
        >
          {value.name}
        </Badge>
      ) : '-'
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: Prompt['tags']) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((tagRel) => (
            <Badge
              key={tagRel.tag.id}
              variant="secondary"
              style={{ 
                backgroundColor: `${tagRel.tag.color}20`, 
                color: tagRel.tag.color 
              }}
            >
              {tagRel.tag.name}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline">+{value.length - 3}</Badge>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: Date) => new Date(value).toLocaleDateString()
    }
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={prompts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actions={(prompt: Prompt) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(prompt)}
            disabled={loading}
          >
            <Star 
              className={`h-4 w-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          </Button>
        )}
      />
    </div>
  )
}