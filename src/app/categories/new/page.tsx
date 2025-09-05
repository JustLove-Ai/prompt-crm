import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getCategories } from '@/lib/actions/categories'
import { NewCategoryForm } from './new-category-form'

export default async function NewCategoryPage() {
  const result = await getCategories()
  const categories = result.success ? result.data : []

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
          <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
          <p className="text-muted-foreground">
            Create a new category to organize your prompts
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewCategoryForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}