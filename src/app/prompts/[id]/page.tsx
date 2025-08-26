'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Star, Copy, ExternalLink, Calendar, Tag as TagIcon } from 'lucide-react'
import Link from 'next/link'
import { ImagePreview } from '@/components/ui/image-preview'
import { VideoPreview } from '@/components/ui/video-preview'

interface Prompt {
  id: string
  title: string
  content: string
  instructions?: string
  sections?: string
  promptType: string
  category?: {
    id: string
    name: string
    color: string
  }
  tags: {
    tag: {
      id: string
      name: string
      color: string
    }
  }[]
  sampleOutputs: {
    id: string
    title?: string
    content?: string
    outputType: string
    filePath?: string
    fileType?: string
  }[]
  isFavorite: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export default function PromptDetailPage() {
  const params = useParams()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPrompt()
    }
  }, [params.id])

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPrompt(data)
      }
    } catch (error) {
      console.error('Failed to fetch prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!prompt) return

    try {
      const response = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: 'POST',
      })
      if (response.ok) {
        const result = await response.json()
        setPrompt(prev => prev ? { ...prev, isFavorite: result.isFavorite } : null)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleCopyPrompt = async () => {
    if (!prompt) return

    try {
      let copyText = prompt.content
      if (prompt.instructions) {
        copyText = `Instructions:\n${prompt.instructions}\n\nPrompt:\n${prompt.content}`
      }
      await navigator.clipboard.writeText(copyText)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prompts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Fetching prompt details</p>
          </div>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prompts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prompt Not Found</h1>
            <p className="text-muted-foreground">The requested prompt could not be found</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse sections from stored JSON or fallback to legacy format
  let displaySections: { type: 'instruction' | 'prompt'; content: string; index: number }[] = []
  
  if (prompt.sections) {
    try {
      const parsedSections = JSON.parse(prompt.sections)
      displaySections = parsedSections.map((section: any, index: number) => ({
        type: section.type,
        content: section.content,
        index
      }))
    } catch (error) {
      console.error('Failed to parse sections:', error)
    }
  }
  
  // Fallback to legacy format if no sections data
  if (displaySections.length === 0) {
    const contentSections = prompt.content.split('\n\n---\n\n').filter(Boolean)
    const instructionSections = prompt.instructions?.split('\n\n---\n\n').filter(Boolean) || []
    
    // Create alternating sections for legacy data
    instructionSections.forEach((instruction, index) => {
      displaySections.push({ type: 'instruction', content: instruction, index: index * 2 })
    })
    contentSections.forEach((content, index) => {
      displaySections.push({ type: 'prompt', content: content, index: index * 2 + 1 })
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prompts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight">{prompt.title}</h1>
              {prompt.isFavorite && <Star className="h-6 w-6 text-yellow-500 fill-current" />}
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(prompt.createdAt).toLocaleDateString()}</span>
              </span>
              <span>Used {prompt.usageCount} times</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleToggleFavorite}>
            <Star className={`mr-2 h-4 w-4 ${prompt.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
            {prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          <Button variant="outline" onClick={handleCopyPrompt}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button asChild>
            <Link href={`/prompts/${prompt.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <div className="mt-1">
                <Badge variant="outline">{prompt.promptType}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <div className="mt-1">
                {prompt.category ? (
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: prompt.category.color }}
                    />
                    <Badge variant="secondary">{prompt.category.name}</Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No category</span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {prompt.tags.length > 0 ? (
                  prompt.tags.map((tagItem) => (
                    <Badge 
                      key={tagItem.tag.id}
                      variant="outline"
                      style={{ 
                        backgroundColor: `${tagItem.tag.color}20`, 
                        color: tagItem.tag.color, 
                        borderColor: tagItem.tag.color 
                      }}
                    >
                      {tagItem.tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections in Sequential Order */}
      {displaySections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prompt Sequence</CardTitle>
            <CardDescription>
              Instructions and prompts in their original order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displaySections
              .sort((a, b) => a.index - b.index)
              .map((section, index) => (
                <div 
                  key={`${section.type}-${index}`} 
                  className={`p-4 rounded-lg border ${
                    section.type === 'instruction' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={section.type === 'instruction' ? 'default' : 'secondary'}
                    >
                      {section.type === 'instruction' ? 'Instructions' : 'Prompt'} {
                        section.type === 'instruction' 
                          ? Math.floor(index / 2) + 1
                          : Math.ceil((index + 1) / 2)
                      }
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(section.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={`whitespace-pre-wrap text-sm ${
                    section.type === 'prompt' ? 'font-mono' : ''
                  }`}>
                    {section.content}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Sample Outputs */}
      {prompt.sampleOutputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Outputs</CardTitle>
            <CardDescription>
              Examples of expected results from this prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prompt.sampleOutputs.map((output, index) => (
              <div key={output.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{output.outputType}</Badge>
                    {output.title && <span className="font-medium">{output.title}</span>}
                  </div>
                  {output.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(output.content || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {output.content && (
                  <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                    {output.content}
                  </div>
                )}
                {output.filePath && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      <span>Attachment: {output.filePath.split('/').pop()}</span>
                    </div>
                    
                    {/* Preview based on file type */}
                    {output.fileType?.startsWith('image/') ? (
                      <ImagePreview
                        src={output.filePath}
                        alt={output.title || 'Sample output image'}
                        filename={output.filePath.split('/').pop()}
                        thumbnailSize="lg"
                        className="max-w-md"
                      />
                    ) : output.fileType?.startsWith('video/') ? (
                      <VideoPreview
                        src={output.filePath}
                        filename={output.filePath.split('/').pop()}
                        thumbnailSize="lg"
                        className="max-w-md"
                      />
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <ExternalLink className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 truncate max-w-24">
                            {output.filePath.split('/').pop()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}