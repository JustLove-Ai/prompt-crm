'use client'

import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { deleteCategory } from '@/lib/actions/categories'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  prompts?: Array<{ id: string; title: string }>
  createdAt: Date
  updatedAt: Date
}

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter()

  const handleEdit = (category: Category) => {
    router.push(`/categories/${category.id}/edit`)
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      const result = await deleteCategory(category.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete category')
      }
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, row: Category) => (
        <div className="flex items-center space-x-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: row.color }}
          />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => value || '-'
    },
    {
      key: 'parent',
      label: 'Parent Category',
      render: (value: Category) => value ? (
        <Badge variant="outline">{value.name}</Badge>
      ) : '-'
    },
    {
      key: 'prompts',
      label: 'Prompts',
      render: (value: Array<{ id: string; title: string }>) => (
        <Badge variant="secondary">
          {value?.length || 0}
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
      data={categories}
      loading={false}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}