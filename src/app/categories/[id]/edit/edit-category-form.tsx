'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { updateCategory } from '@/lib/actions/categories'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  parentId?: string
}

interface EditCategoryFormProps {
  category: Category
  categories: Category[]
}

const defaultColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // yellow
  '#ef4444', // red
  '#6366f1', // indigo
  '#ec4899', // pink
  '#06b6d4', // cyan
]

export function EditCategoryForm({ category, categories }: EditCategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    color: category.color,
    parentId: category.parentId || 'none'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateCategory(category.id, {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      parentId: formData.parentId === 'none' ? undefined : formData.parentId
    })

    if (result.success) {
      router.push('/categories')
    } else {
      alert(result.error || 'Failed to update category')
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Filter out the current category from parent options to prevent self-reference
  const availableParents = categories.filter(c => c.id !== category.id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter category name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter category description (optional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category</Label>
        <Select value={formData.parentId} onValueChange={(value) => handleInputChange('parentId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select parent category (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Root Category)</SelectItem>
            {availableParents.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex space-x-2">
          {defaultColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 ${
                formData.color === color ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleInputChange('color', color)}
            />
          ))}
        </div>
        <Input
          type="color"
          value={formData.color}
          onChange={(e) => handleInputChange('color', e.target.value)}
          className="w-20 h-8"
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Updating...' : 'Update Category'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/categories">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}