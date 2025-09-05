'use client'

import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { deleteTag } from '@/lib/actions/tags'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  color: string
  prompts?: Array<{ id: string; prompt: { title: string } }>
  createdAt: Date
  updatedAt: Date
}

interface TagsClientProps {
  tags: Tag[]
}

export function TagsClient({ tags }: TagsClientProps) {
  const router = useRouter()

  const handleEdit = (tag: Tag) => {
    router.push(`/tags/${tag.id}/edit`)
  }

  const handleDelete = async (tag: Tag) => {
    if (confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      const result = await deleteTag(tag.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete tag')
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
      render: (value: Array<{ id: string; prompt: { title: string } }>) => (
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
    <DataTable
      columns={columns}
      data={tags}
      loading={false}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}