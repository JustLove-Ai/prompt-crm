'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileDown, 
  Edit, 
  Trash2, 
  Calendar,
  BookOpen,
  Users,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface EbookExport {
  id: string
  title: string
  subtitle?: string | null
  author?: string | null
  status: 'DRAFT' | 'READY' | 'EXPORTED'
  createdAt: Date | string
  updatedAt: Date | string
  prompts: {
    prompt: {
      title: string
      promptType: string
    }
  }[]
  _count: {
    prompts: number
    customPages: number
  }
}

export default function ExportsPage() {
  const [exports, setExports] = useState<EbookExport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExports()
  }, [])

  const fetchExports = async () => {
    try {
      const { getAllEbookExports } = await import('@/lib/ebook-actions')
      const result = await getAllEbookExports()

      if (result.success && result.data) {
        setExports(result.data)
      } else {
        console.error('Failed to fetch exports:', result.error)
      }
    } catch (error) {
      console.error('Failed to fetch exports:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteExport = async (exportId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const { deleteEbookExport } = await import('@/lib/ebook-actions')
        const result = await deleteEbookExport(exportId)

        if (result.success) {
          fetchExports()
        } else {
          alert(result.error || 'Failed to delete export')
        }
      } catch (error) {
        console.error('Failed to delete export:', error)
        alert('Failed to delete export')
      }
    }
  }

  const downloadPDF = async (exportId: string, title: string) => {
    try {
      const response = await fetch(`/api/exports/${exportId}/pdf`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        // Refresh the list to update status
        fetchExports()
      } else {
        alert('Failed to generate PDF')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'READY':
        return 'bg-blue-100 text-blue-800'
      case 'EXPORTED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPromptTypeStats = (prompts: EbookExport['prompts']) => {
    const counts: Record<string, number> = {}
    prompts.forEach(p => {
      counts[p.prompt.promptType] = (counts[p.prompt.promptType] || 0) + 1
    })
    return Object.entries(counts).slice(0, 3)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDF Exports</h1>
          <p className="text-muted-foreground">
            Manage and download your prompt ebooks
          </p>
        </div>
        <Button asChild>
          <Link href="/exports/new">
            <Plus className="mr-2 h-4 w-4" />
            New Export
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Export</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exports.filter(e => e.status === 'READY').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exported</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exports.filter(e => e.status === 'EXPORTED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exports.reduce((sum, exp) => sum + exp._count.prompts, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exports List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : exports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No exports yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first ebook export to get started
              </p>
              <Button asChild>
                <Link href="/exports/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Export
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          exports.map((exportItem) => (
            <Card key={exportItem.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium truncate">
                        {exportItem.title}
                      </h3>
                      <Badge className={getStatusColor(exportItem.status)}>
                        {exportItem.status}
                      </Badge>
                    </div>
                    
                    {exportItem.subtitle && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {exportItem.subtitle}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{exportItem._count.prompts} prompts</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(exportItem.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {new Date(exportItem.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {exportItem.author && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>by {exportItem.author}</span>
                        </div>
                      )}
                    </div>

                    {/* Prompt Type Distribution */}
                    <div className="flex items-center space-x-2">
                      {getPromptTypeStats(exportItem.prompts).map(([type, count]) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}: {count}
                        </Badge>
                      ))}
                      {exportItem.prompts.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{exportItem.prompts.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(exportItem.id, exportItem.title)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/exports/${exportItem.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteExport(exportItem.id, exportItem.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}