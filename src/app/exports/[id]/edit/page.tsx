'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor, SimpleTextEditor } from '@/components/ui/rich-text-editor'
import { DraggablePromptList } from '@/components/ui/draggable-prompt-list'
import { 
  ArrowLeft, 
  FileDown, 
  Save, 
  BookOpen,
  Settings,
  Layout,
  FileText
} from 'lucide-react'
import Link from 'next/link'

// Types
interface EbookData {
  id: string
  title: string
  subtitle?: string
  author?: string
  coverImage?: string
  aboutText?: string
  includeCategories?: boolean
  includeTags?: boolean
  thankYouTitle?: string
  thankYouMessage?: string
  status: 'DRAFT' | 'READY' | 'EXPORTED'
  createdAt?: Date
  updatedAt?: Date
  prompts: {
    id: string
    order: number
    customTitle?: string
    customIntro?: string
    includeInstructions: boolean
    includeSamples: boolean
    prompt: {
      id: string
      title: string
      content: string
      instructions?: string
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
      sampleOutputs: any[]
    }
  }[]
  customPages: {
    id: string
    title?: string
    content: string
    order: number
    pageType: string
    imageUrl?: string
  }[]
}

type TabType = 'cover' | 'about' | 'content' | 'thankyou' | 'settings'

export default function EbookEditorPage() {
  const params = useParams()
  const [ebook, setEbook] = useState<EbookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('cover')
  
  // Form states
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [author, setAuthor] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [includeCategories, setIncludeCategories] = useState(false)
  const [includeTags, setIncludeTags] = useState(false)
  const [thankYouTitle, setThankYouTitle] = useState('Thank You')
  const [thankYouMessage, setThankYouMessage] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchEbook()
    }
  }, [params.id])

  useEffect(() => {
    if (ebook) {
      setTitle(ebook.title)
      setSubtitle(ebook.subtitle || '')
      setAuthor(ebook.author || '')
      setAboutText(ebook.aboutText || '')
      setCoverImage(ebook.coverImage || '')
      setIncludeCategories(ebook.includeCategories || false)
      setIncludeTags(ebook.includeTags || false)
      setThankYouTitle(ebook.thankYouTitle || 'Thank You')
      setThankYouMessage(ebook.thankYouMessage || '')
    }
  }, [ebook])

  const fetchEbook = async () => {
    try {
      const { getEbookExport } = await import('@/lib/ebook-actions')
      const result = await getEbookExport(params.id as string)

      if (result.success && result.data) {
        setEbook({
          ...result.data,
          subtitle: result.data.subtitle || undefined,
          author: result.data.author || undefined,
          coverImage: result.data.coverImage || undefined,
          aboutText: result.data.aboutText || undefined,
          thankYouTitle: result.data.thankYouTitle || undefined,
          thankYouMessage: result.data.thankYouMessage || undefined,
          customPages: result.data.customPages.map(page => ({
            ...page,
            title: page.title || undefined,
            imageUrl: page.imageUrl || undefined
          })),
          prompts: result.data.prompts.map(p => ({
            ...p,
            customTitle: p.customTitle || undefined,
            customIntro: p.customIntro || undefined,
            prompt: {
              ...p.prompt,
              instructions: p.prompt.instructions || undefined,
              category: p.prompt.category ? {
                id: p.prompt.category.id,
                name: p.prompt.category.name,
                color: p.prompt.category.color
              } : undefined
            }
          }))
        })
      } else {
        console.error('Failed to fetch ebook:', result.error)
      }
    } catch (error) {
      console.error('Failed to fetch ebook:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEbook = async () => {
    if (!ebook) return

    console.log('🔄 Save button clicked, starting save process...')
    setSaving(true)
    try {
      console.log('🔄 Importing server actions...')
      const { updateEbookExport } = await import('@/lib/ebook-actions')
      
      const updateData = {
        title: title.trim() || 'Untitled Ebook',
        subtitle: subtitle.trim() || undefined,
        author: author.trim() || undefined,
        aboutText: aboutText.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        includeCategories,
        includeTags,
        thankYouTitle: thankYouTitle.trim() || 'Thank You',
        thankYouMessage: thankYouMessage.trim() || undefined,
      }
      console.log('🔄 Calling updateEbookExport with:', updateData)
      
      const result = await updateEbookExport(ebook.id, updateData)
      console.log('🔄 Server action result:', result)

      if (result.success && result.data) {
        setEbook({
          ...result.data,
          subtitle: result.data.subtitle || undefined,
          author: result.data.author || undefined,
          coverImage: result.data.coverImage || undefined,
          aboutText: result.data.aboutText || undefined,
          thankYouTitle: result.data.thankYouTitle || undefined,
          thankYouMessage: result.data.thankYouMessage || undefined,
          customPages: result.data.customPages.map(page => ({
            ...page,
            title: page.title || undefined,
            imageUrl: page.imageUrl || undefined
          })),
          prompts: result.data.prompts.map(p => ({
            ...p,
            customTitle: p.customTitle || undefined,
            customIntro: p.customIntro || undefined,
            prompt: {
              ...p.prompt,
              instructions: p.prompt.instructions || undefined,
              category: p.prompt.category ? {
                id: p.prompt.category.id,
                name: p.prompt.category.name,
                color: p.prompt.category.color
              } : undefined
            }
          }))
        })
        console.log('✅ Save successful')
      } else {
        console.error('❌ Save failed:', result.error)
        alert(result.error || 'Failed to save ebook')
      }
    } catch (error) {
      console.error('❌ Save error:', error)
      alert('Failed to save ebook')
    } finally {
      setSaving(false)
    }
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (response.ok) {
            const result = await response.json()
            setCoverImage(result.filePath)
          }
        } catch (error) {
          console.error('Upload error:', error)
          alert('Failed to upload image')
        }
      }
    }
  }

  const handlePromptReorder = async (startIndex: number, endIndex: number) => {
    if (!ebook) return

    // Create new order for prompts
    const sortedPrompts = [...ebook.prompts].sort((a, b) => a.order - b.order)
    const [removed] = sortedPrompts.splice(startIndex, 1)
    sortedPrompts.splice(endIndex, 0, removed)

    // Update orders
    const updates = sortedPrompts.map((prompt, index) => ({
      id: prompt.id,
      order: index
    }))

    try {
      const { updateEbookPromptOrder } = await import('@/lib/ebook-actions')
      const result = await updateEbookPromptOrder(ebook.id, updates)

      if (result.success) {
        // Update local state
        const updatedPrompts = ebook.prompts.map(prompt => {
          const update = updates.find(u => u.id === prompt.id)
          return update ? { ...prompt, order: update.order } : prompt
        })
        setEbook({ ...ebook, prompts: updatedPrompts })
      } else {
        alert(result.error || 'Failed to reorder prompts')
      }
    } catch (error) {
      console.error('Reorder error:', error)
      alert('Failed to reorder prompts')
    }
  }

  const handlePromptUpdate = async (promptId: string, updates: any) => {
    try {
      const { updateEbookPrompt } = await import('@/lib/ebook-actions')
      const result = await updateEbookPrompt(promptId, updates)

      if (result.success) {
        // Update local state
        const updatedPrompts = ebook!.prompts.map(prompt => 
          prompt.id === promptId ? { ...prompt, ...updates } : prompt
        )
        setEbook({ ...ebook!, prompts: updatedPrompts })
      } else {
        alert(result.error || 'Failed to update prompt')
      }
    } catch (error) {
      console.error('Prompt update error:', error)
      alert('Failed to update prompt')
    }
  }

  const generatePDF = async () => {
    if (!ebook) return

    setExporting(true)
    try {
      // This will be implemented with the PDF generation service
      const response = await fetch(`/api/exports/${ebook.id}/pdf`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${ebook.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to generate PDF')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/exports/new">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Loading ebook editor</p>
          </div>
        </div>
      </div>
    )
  }

  if (!ebook) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/exports/new">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ebook Not Found</h1>
            <p className="text-muted-foreground">The requested ebook could not be found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/exports/new">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Ebook</h1>
            <p className="text-muted-foreground">
              {ebook.prompts.length} prompt{ebook.prompts.length !== 1 ? 's' : ''} • {ebook.status}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={saveEbook} 
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" onClick={generatePDF} disabled={exporting}>
            <FileDown className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'cover' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('cover')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Cover
            </Button>
            <Button
              variant={activeTab === 'about' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('about')}
            >
              <FileText className="mr-2 h-4 w-4" />
              About
            </Button>
            <Button
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('content')}
            >
              <Layout className="mr-2 h-4 w-4" />
              Content
            </Button>
            <Button
              variant={activeTab === 'thankyou' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('thankyou')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Thank You
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      {activeTab === 'cover' && (
        <Card>
          <CardHeader>
            <CardTitle>Cover Design</CardTitle>
            <CardDescription>
              Design your ebook cover with title, subtitle, and cover image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter ebook title"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter ebook subtitle"
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <Label htmlFor="coverImage">Cover Image</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {coverImage && (
                    <div className="mt-2">
                      <img 
                        src={coverImage} 
                        alt="Cover preview" 
                        className="max-w-32 h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-lg shadow-lg max-w-sm w-full aspect-[3/4] flex flex-col justify-between">
                  {coverImage && (
                    <div className="flex-1 flex items-center justify-center mb-4">
                      <img 
                        src={coverImage} 
                        alt="Cover" 
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {title || 'Ebook Title'}
                    </h2>
                    {subtitle && (
                      <p className="text-lg opacity-90 mb-4">
                        {subtitle}
                      </p>
                    )}
                    <p className="text-sm opacity-75">
                      {author || 'Author Name'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'about' && (
        <Card>
          <CardHeader>
            <CardTitle>About Page</CardTitle>
            <CardDescription>
              Write an introduction or description for your ebook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={aboutText}
              onChange={setAboutText}
              placeholder="Write about your ebook, what readers will learn, or provide context for the prompts included..."
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle>Table of Contents</CardTitle>
            <CardDescription>
              Arrange your prompts in the order they'll appear in the ebook. Drag to reorder, click icons to toggle content, or edit for custom titles and introductions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DraggablePromptList 
              prompts={ebook.prompts}
              onReorder={handlePromptReorder}
              onUpdatePrompt={handlePromptUpdate}
              ebookId={ebook.id}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'thankyou' && (
        <Card>
          <CardHeader>
            <CardTitle>Thank You Page</CardTitle>
            <CardDescription>
              Customize the final page of your ebook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="thankYouTitle">Title *</Label>
                  <Input
                    id="thankYouTitle"
                    value={thankYouTitle}
                    onChange={(e) => setThankYouTitle(e.target.value)}
                    placeholder="Thank You"
                  />
                </div>
                <div>
                  <Label htmlFor="thankYouMessage">Message</Label>
                  <RichTextEditor
                    value={thankYouMessage}
                    onChange={setThankYouMessage}
                    placeholder="Write a thank you message to your readers..."
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-lg shadow-lg max-w-sm w-full aspect-[3/4] flex flex-col justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                      {thankYouTitle || 'Thank You'}
                    </h2>
                    {thankYouMessage && (
                      <div className="text-sm opacity-90 mb-4">
                        {thankYouMessage.substring(0, 200)}
                        {thankYouMessage.length > 200 && '...'}
                      </div>
                    )}
                    <p className="text-xs opacity-75">
                      This ebook contains {ebook.prompts.length} carefully curated prompts
                      {ebook.author && ` by ${ebook.author}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>
              Configure how your ebook will be generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PDF Export Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">PDF Export Options</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="includeCategories">Include Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Show prompt categories in the PDF
                  </p>
                </div>
                <Switch
                  id="includeCategories"
                  checked={includeCategories}
                  onCheckedChange={setIncludeCategories}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="includeTags">Include Tags</Label>
                  <p className="text-sm text-muted-foreground">
                    Show prompt tags in the PDF
                  </p>
                </div>
                <Switch
                  id="includeTags"
                  checked={includeTags}
                  onCheckedChange={setIncludeTags}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div>
                <Label>Status</Label>
                <div className="mt-2">
                  <Badge variant={ebook.status === 'READY' ? 'default' : 'secondary'}>
                    {ebook.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Export Information</Label>
              <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                <p>• {ebook.prompts.length} prompts included</p>
                <p>• {ebook.customPages.length} custom pages</p>
                {ebook.createdAt && <p>• Created: {new Date(ebook.createdAt).toLocaleDateString()}</p>}
                {ebook.updatedAt && <p>• Last updated: {new Date(ebook.updatedAt).toLocaleDateString()}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}