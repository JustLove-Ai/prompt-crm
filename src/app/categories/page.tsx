import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { getCategories } from '@/lib/actions/categories'
import { CategoriesClient } from './categories-client'

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

async function CategoriesPage() {
  const result = await getCategories()
  const categories = result.success ? result.data : []

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
          <CategoriesClient categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}

export default CategoriesPage