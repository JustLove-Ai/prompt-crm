'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { updateTag } from '@/lib/actions/tags'

interface Tag {
  id: string
  name: string
  color: string
  prompts?: Array<{ id: string; prompt: { title: string } }>
}

interface EditTagFormProps {
  tag: Tag
}

const defaultColors = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // yellow
  '#ef4444', // red
  '#6366f1', // indigo
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

export function EditTagForm({ tag }: EditTagFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: tag.name,
    color: tag.color
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateTag(tag.id, {
      name: formData.name,
      color: formData.color
    })

    if (result.success) {
      router.push('/tags')
    } else {
      alert(result.error || 'Failed to update tag')
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter tag name"
          required
        />
        <p className="text-sm text-muted-foreground">
          Tag names should be short and descriptive (e.g., &quot;marketing&quot;, &quot;technical&quot;, &quot;urgent&quot;)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex space-x-2 flex-wrap gap-2">
          {defaultColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleInputChange('color', color)}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2 mt-3">
          <Label htmlFor="custom-color" className="text-sm">Custom:</Label>
          <Input
            id="custom-color"
            type="color"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className="w-16 h-8"
          />
          <span className="text-sm text-muted-foreground">{formData.color}</span>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="p-3 bg-gray-50 rounded-md">
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{ 
              backgroundColor: `${formData.color}20`, 
              color: formData.color, 
              borderColor: formData.color 
            }}
          >
            {formData.name || 'Tag Name'}
          </span>
        </div>
      </div>

      {/* Usage Info */}
      {tag.prompts && tag.prompts.length > 0 && (
        <div className="space-y-2">
          <Label>Usage</Label>
          <p className="text-sm text-muted-foreground">
            This tag is currently used in {tag.prompts.length} prompt{tag.prompts.length !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Updating...' : 'Update Tag'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/tags">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}