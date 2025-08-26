'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Tags } from 'lucide-react'
import Link from 'next/link'

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

export default function EditTagPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    color: '#10b981'
  })

  useEffect(() => {
    if (params.id) {
      fetchTag()
    }
  }, [params.id])

  const fetchTag = async () => {
    try {
      const response = await fetch(`/api/tags/${params.id}`)
      if (response.ok) {
        const tag = await response.json()
        setFormData({
          name: tag.name,
          color: tag.color
        })
      }
    } catch (error) {
      console.error('Failed to fetch tag:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tags/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/tags')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update tag')
      }
    } catch (error) {
      console.error('Failed to update tag:', error)
      alert('Failed to update tag')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tags">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Tag</h1>
            <p className="text-muted-foreground">Loading tag details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Tag</h1>
          <p className="text-muted-foreground">
            Update tag information
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tags className="h-5 w-5" />
            <span>Tag Details</span>
          </CardTitle>
          <CardDescription>
            Update the tag information below
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                Tag names should be short and descriptive (e.g., "marketing", "technical", "urgent")
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
        </CardContent>
      </Card>
    </div>
  )
}