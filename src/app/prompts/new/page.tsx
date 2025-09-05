'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EnhancedSelect } from '@/components/ui/enhanced-select'
import { EnhancedMultiSelect } from '@/components/ui/enhanced-multi-select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Plus, X, FileText, Image } from 'lucide-react'
import Link from 'next/link'
import { FileUpload, UploadedFile } from '@/components/ui/file-upload'
import { ImagePreview } from '@/components/ui/image-preview'
import { VideoPreview } from '@/components/ui/video-preview'
import { getCategories } from '@/lib/actions/categories'
import { getTags, createTag } from '@/lib/actions/tags'
import { createCategory } from '@/lib/actions/categories'
import { createPrompt } from '@/lib/actions/prompts'

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

interface PromptSection {
  id: string
  type: 'instruction' | 'prompt'
  content: string
}

interface SampleOutput {
  id: string
  title: string
  content: string
  outputType: 'TEXT' | 'IMAGE' | 'FILE'
  filePath?: string
  fileType?: string
  attachedFiles?: UploadedFile[]
}

const promptTypes = [
  'CODE',
  'IMAGE',
  'BUSINESS', 
  'TECHNICAL',
  'CREATIVE',
  'ANALYSIS',
  'MARKETING',
  'OTHER'
]

export default function NewPromptPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    promptType: 'OTHER',
    categoryId: 'none',
    tagIds: [] as string[],
    isFavorite: false
  })

  const [sections, setSections] = useState<PromptSection[]>([
    { id: '1', type: 'instruction', content: '' },
    { id: '2', type: 'prompt', content: '' }
  ])

  const [sampleOutputs, setSampleOutputs] = useState<SampleOutput[]>([])

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  const fetchCategories = async () => {
    try {
      const result = await getCategories()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const result = await getTags()
      if (result.success) {
        setTags(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const addSection = (type: 'instruction' | 'prompt') => {
    const newSection: PromptSection = {
      id: Date.now().toString(),
      type,
      content: ''
    }
    setSections([...sections, newSection])
  }

  const updateSection = (id: string, content: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, content } : section
    ))
  }

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id))
    }
  }

  const addSampleOutput = () => {
    const newOutput: SampleOutput = {
      id: Date.now().toString(),
      title: '',
      content: '',
      outputType: 'TEXT',
      attachedFiles: []
    }
    setSampleOutputs([...sampleOutputs, newOutput])
  }

  const updateSampleOutput = (id: string, field: keyof SampleOutput, value: string) => {
    setSampleOutputs(sampleOutputs.map(output =>
      output.id === id ? { ...output, [field]: value } : output
    ))
  }

  const handleFileUpload = (outputId: string, file: UploadedFile) => {
    setSampleOutputs(sampleOutputs.map(output =>
      output.id === outputId 
        ? { ...output, attachedFiles: [...(output.attachedFiles || []), file] }
        : output
    ))
  }

  const handleFileRemove = (outputId: string, filename: string) => {
    setSampleOutputs(sampleOutputs.map(output =>
      output.id === outputId 
        ? { ...output, attachedFiles: (output.attachedFiles || []).filter(f => f.filename !== filename) }
        : output
    ))
  }

  const removeSampleOutput = (id: string) => {
    setSampleOutputs(sampleOutputs.filter(output => output.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine all sections into content and instructions
      const promptSections = sections.filter(s => s.type === 'prompt')
      const instructionSections = sections.filter(s => s.type === 'instruction')
      
      const content = promptSections.map(s => s.content).join('\n\n---\n\n')
      const instructions = instructionSections.map(s => s.content).join('\n\n---\n\n')

      // Process sample outputs with file attachments
      const processedSampleOutputs = sampleOutputs
        .filter(output => output.title || output.content || (output.attachedFiles && output.attachedFiles.length > 0))
        .map(output => ({
          title: output.title,
          content: output.content,
          outputType: output.outputType,
          filePath: output.attachedFiles && output.attachedFiles.length > 0 
            ? output.attachedFiles[0].filePath 
            : output.filePath,
          fileType: output.attachedFiles && output.attachedFiles.length > 0 
            ? output.attachedFiles[0].fileType 
            : output.fileType,
          includeInExport: true
        }))

      const result = await createPrompt({
        ...formData,
        content,
        instructions: instructions || undefined,
        sections: sections,
        categoryId: formData.categoryId === 'none' ? undefined : formData.categoryId,
        sampleOutputs: processedSampleOutputs
      })

      if (result.success) {
        router.push('/prompts')
      } else {
        alert(result.error || 'Failed to create prompt')
      }
    } catch (error) {
      console.error('Failed to create prompt:', error)
      alert('Failed to create prompt')
    } finally {
      setLoading(false)
    }
  }

  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color
  }))

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
    color: category.color
  }))

  const createNewTag = async (name: string, color?: string) => {
    try {
      const result = await createTag({
        name,
        color: color || '#10b981'
      })

      if (result.success && result.data) {
        const newTag = result.data
        setTags(prev => [...prev, newTag])
        return {
          value: newTag.id,
          label: newTag.name,
          color: newTag.color
        }
      } else {
        throw new Error(result.error || 'Failed to create tag')
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
      throw error
    }
  }

  const createNewCategory = async (name: string, color?: string) => {
    try {
      const result = await createCategory({
        name,
        color: color || '#3b82f6'
      })

      if (result.success && result.data) {
        const newCategory = result.data
        setCategories(prev => [...prev, newCategory])
        return {
          value: newCategory.id,
          label: newCategory.name,
          color: newCategory.color
        }
      } else {
        throw new Error(result.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/prompts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Prompt</h1>
          <p className="text-muted-foreground">
            Create a new prompt with instructions and sample outputs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Set the title, type, and organization for your prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter prompt title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promptType">Type</Label>
                <Select 
                  value={formData.promptType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, promptType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prompt type" />
                  </SelectTrigger>
                  <SelectContent>
                    {promptTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <EnhancedSelect
                  options={categoryOptions}
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  onCreateNew={createNewCategory}
                  placeholder="Select category (optional)"
                  searchPlaceholder="Search categories..."
                  emptyText="No categories found."
                  createNewLabel="Create category"
                  createNewTitle="Create New Category"
                  createNewDescription="Enter the name and color for the new category."
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <EnhancedMultiSelect
                  options={tagOptions}
                  selected={formData.tagIds}
                  onChange={(tagIds) => setFormData(prev => ({ ...prev, tagIds }))}
                  onCreateNew={createNewTag}
                  placeholder="Select tags..."
                  searchPlaceholder="Search tags..."
                  emptyText="No tags found."
                  createNewLabel="Create tag"
                  createNewTitle="Create New Tag"
                  createNewDescription="Enter the name and color for the new tag."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Content */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Content</CardTitle>
            <CardDescription>
              Build your prompt with instructions and actual prompts. You can add multiple sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={section.type === 'instruction' ? 'default' : 'secondary'}>
                      {section.type === 'instruction' ? 'Instructions' : 'Prompt'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Section {index + 1}</span>
                  </div>
                  {sections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  placeholder={
                    section.type === 'instruction' 
                      ? "Enter instructions for using this prompt..."
                      : "Enter the actual prompt content..."
                  }
                  rows={4}
                />
              </div>
            ))}

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSection('instruction')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Instructions
              </Button>
              <Button
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => addSection('prompt')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Prompt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Outputs */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Outputs</CardTitle>
            <CardDescription>
              Add examples of expected outputs to help understand the prompt&apos;s purpose
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleOutputs.map((output, index) => (
              <div key={output.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {output.outputType === 'TEXT' && <FileText className="h-4 w-4" />}
                    {output.outputType === 'IMAGE' && <Image className="h-4 w-4" alt="" />}
                    <span className="text-sm font-medium">Sample Output {index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSampleOutput(output.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={output.title}
                      onChange={(e) => updateSampleOutput(output.id, 'title', e.target.value)}
                      placeholder="Sample output title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={output.outputType} 
                      onValueChange={(value) => updateSampleOutput(output.id, 'outputType', value as 'TEXT' | 'IMAGE' | 'FILE')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="FILE">File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={output.content}
                    onChange={(e) => updateSampleOutput(output.id, 'content', e.target.value)}
                    placeholder="Paste sample output content here..."
                    rows={3}
                  />
                </div>

                {/* File Attachments */}
                <div className="space-y-2">
                  <Label>File Attachments</Label>
                  <FileUpload
                    onFileUpload={(file) => handleFileUpload(output.id, file)}
                    onFileRemove={(filename) => handleFileRemove(output.id, filename)}
                    uploadedFiles={output.attachedFiles || []}
                    maxFiles={999}
                  />
                </div>

                {/* Preview Attached Files */}
                {(output.attachedFiles || []).length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {(output.attachedFiles || []).map((file) => (
                        <div key={file.filename}>
                          {file.category === 'images' ? (
                            <ImagePreview
                              src={file.filePath}
                              alt={file.originalName}
                              filename={file.originalName}
                              thumbnailSize="lg"
                              onRemove={() => handleFileRemove(output.id, file.filename)}
                            />
                          ) : file.category === 'videos' ? (
                            <VideoPreview
                              src={file.filePath}
                              filename={file.originalName}
                              thumbnailSize="lg"
                              onRemove={() => handleFileRemove(output.id, file.filename)}
                            />
                          ) : (
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                              <div className="text-center">
                                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-xs text-gray-500 truncate max-w-24">{file.originalName}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addSampleOutput}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Sample Output
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex space-x-4">
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Prompt'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/prompts">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}