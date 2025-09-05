import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getCategoryById, getCategories } from '@/lib/actions/categories'
import { EditCategoryForm } from './edit-category-form'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params
  
  const [categoryResult, categoriesResult] = await Promise.all([
    getCategoryById(id),
    getCategories()
  ])

  if (!categoryResult.success) {
    redirect('/categories')
  }

  const category = categoryResult.data!
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update the category details
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Modify the information below to update the category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditCategoryForm category={category} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}