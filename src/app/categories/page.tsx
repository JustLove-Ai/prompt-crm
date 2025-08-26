'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  prompts?: any[]
  createdAt: Date
  updatedAt: Date
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    // Navigate to edit page
    window.location.href = `/categories/${category.id}/edit`
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchCategories()
        }
      } catch (error) {
        console.error('Failed to delete category:', error)
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
      render: (value: any[]) => (
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize your prompts with categories
          </p>
        </div>
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(c => !c.parentId).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(c => c.parentId).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Manage your prompt categories and their hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  )
}