'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GripVertical, 
  Edit3, 
  Check, 
  X, 
  Eye,
  EyeOff,
  FileText,
  Image,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface EbookPrompt {
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
    sampleOutputs: {
      id: string
      title?: string
      content?: string
      outputType: string
      filePath?: string
      includeInExport?: boolean
    }[]
  }
}

interface DraggablePromptListProps {
  prompts: EbookPrompt[]
  onReorder: (startIndex: number, endIndex: number) => void
  onUpdatePrompt: (promptId: string, updates: Partial<EbookPrompt>) => void
  ebookId: string
}

export function DraggablePromptList({ 
  prompts, 
  onReorder, 
  onUpdatePrompt,
  ebookId 
}: DraggablePromptListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedSamplesId, setExpandedSamplesId] = useState<string | null>(null)
  const [sampleInclusions, setSampleInclusions] = useState<Record<string, boolean>>({})
  const [editForm, setEditForm] = useState<{
    customTitle: string
    customIntro: string
    includeInstructions: boolean
    includeSamples: boolean
  }>({
    customTitle: '',
    customIntro: '',
    includeInstructions: true,
    includeSamples: true
  })

  // Initialize sample inclusions from the database data
  useEffect(() => {
    const initialInclusions: Record<string, boolean> = {}
    prompts.forEach(ebookPrompt => {
      ebookPrompt.prompt.sampleOutputs.forEach(sample => {
        if (sample.id) {
          // Use database value if available, otherwise default to true
          initialInclusions[sample.id] = sample.includeInExport ?? true
        }
      })
    })
    setSampleInclusions(initialInclusions)
    console.log('🔄 Initialized sample inclusions:', initialInclusions)
  }, [prompts])

  const sortedPrompts = [...prompts].sort((a, b) => a.order - b.order)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const startIndex = result.source.index
    const endIndex = result.destination.index

    if (startIndex !== endIndex) {
      onReorder(startIndex, endIndex)
    }
  }

  const startEditing = (prompt: EbookPrompt) => {
    setEditingId(prompt.id)
    setEditForm({
      customTitle: prompt.customTitle || '',
      customIntro: prompt.customIntro || '',
      includeInstructions: prompt.includeInstructions,
      includeSamples: prompt.includeSamples
    })
  }

  const saveEdit = () => {
    if (editingId) {
      onUpdatePrompt(editingId, {
        customTitle: editForm.customTitle.trim() || undefined,
        customIntro: editForm.customIntro.trim() || undefined,
        includeInstructions: editForm.includeInstructions,
        includeSamples: editForm.includeSamples
      })
      setEditingId(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      customTitle: '',
      customIntro: '',
      includeInstructions: true,
      includeSamples: true
    })
  }

  const toggleInstructions = (promptId: string, currentValue: boolean) => {
    onUpdatePrompt(promptId, { includeInstructions: !currentValue })
  }

  const toggleSamples = (promptId: string, currentValue: boolean) => {
    onUpdatePrompt(promptId, { includeSamples: !currentValue })
  }

  const toggleSampleOutputInclusion = async (sampleOutputId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/sample-outputs/${sampleOutputId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeInExport: !currentValue
        })
      })

      if (response.ok) {
        // Update local state to reflect the change
        setSampleInclusions(prev => ({
          ...prev,
          [sampleOutputId]: !currentValue
        }))
      } else {
        console.error('Failed to update sample output inclusion')
      }
    } catch (error) {
      console.error('Error updating sample output inclusion:', error)
    }
  }
  
  const getSampleInclusionState = (sampleId: string, defaultValue?: boolean): boolean => {
    return sampleInclusions[sampleId] ?? defaultValue ?? true
  }

  const toggleSamplesExpansion = (promptId: string) => {
    setExpandedSamplesId(expandedSamplesId === promptId ? null : promptId)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="prompts">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {sortedPrompts.map((ebookPrompt, index) => (
              <Draggable 
                key={ebookPrompt.id} 
                draggableId={ebookPrompt.id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${snapshot.isDragging ? 'shadow-lg rotate-3' : ''}`}
                  >
                    <CardContent className="p-4">
                      {editingId === ebookPrompt.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[2rem]">
                              {index + 1}.
                            </span>
                            <div className="flex-1 space-y-3">
                              <div>
                                <Label className="text-xs">Custom Title (optional)</Label>
                                <Input
                                  value={editForm.customTitle}
                                  onChange={(e) => setEditForm(prev => ({ 
                                    ...prev, 
                                    customTitle: e.target.value 
                                  }))}
                                  placeholder={ebookPrompt.prompt.title}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Introduction (optional)</Label>
                                <Input
                                  value={editForm.customIntro}
                                  onChange={(e) => setEditForm(prev => ({ 
                                    ...prev, 
                                    customIntro: e.target.value 
                                  }))}
                                  placeholder="Add context or explanation before this prompt..."
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editForm.includeInstructions}
                                    onChange={(e) => setEditForm(prev => ({ 
                                      ...prev, 
                                      includeInstructions: e.target.checked 
                                    }))}
                                    className="rounded"
                                  />
                                  <span>Include Instructions</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editForm.includeSamples}
                                    onChange={(e) => setEditForm(prev => ({ 
                                      ...prev, 
                                      includeSamples: e.target.checked 
                                    }))}
                                    className="rounded"
                                  />
                                  <span>Include Samples</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={saveEdit}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start space-x-3">
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-1"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-shrink-0 text-sm text-muted-foreground font-medium min-w-[2rem] mt-1">
                            {index + 1}.
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start space-x-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {ebookPrompt.customTitle || ebookPrompt.prompt.title}
                                </h4>
                                {ebookPrompt.customIntro && (
                                  <p className="text-xs text-blue-600 italic mt-1">
                                    "{ebookPrompt.customIntro}"
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {ebookPrompt.prompt.promptType}
                                </Badge>
                                {ebookPrompt.prompt.category && (
                                  <div className="flex items-center space-x-1">
                                    <div 
                                      className="h-2 w-2 rounded-full" 
                                      style={{ backgroundColor: ebookPrompt.prompt.category.color }}
                                    />
                                    <Badge variant="secondary" className="text-xs">
                                      {ebookPrompt.prompt.category.name}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {ebookPrompt.prompt.content.substring(0, 150)}...
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  {ebookPrompt.includeInstructions ? (
                                    <Eye className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={ebookPrompt.includeInstructions ? 'text-green-600' : ''}>
                                    Instructions
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" onClick={() => toggleSamplesExpansion(ebookPrompt.id)}>
                                  {ebookPrompt.includeSamples ? (
                                    <Eye className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={ebookPrompt.includeSamples ? 'text-green-600 font-medium' : 'font-medium'}>
                                    Samples ({ebookPrompt.prompt.sampleOutputs.length})
                                  </span>
                                  {ebookPrompt.prompt.sampleOutputs.length > 0 && (
                                    <span className="text-xs text-blue-600">
                                      {expandedSamplesId === ebookPrompt.id ? 'Hide individual selection' : 'Click to select individual samples'}
                                    </span>
                                  )}
                                  {expandedSamplesId === ebookPrompt.id ? (
                                    <ChevronUp className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-blue-600" />
                                  )}
                                </div>
                                {ebookPrompt.prompt.tags.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    {ebookPrompt.prompt.tags.slice(0, 2).map((tagItem) => (
                                      <Badge 
                                        key={tagItem.tag.id}
                                        variant="outline"
                                        className="text-xs"
                                        style={{ 
                                          backgroundColor: `${tagItem.tag.color}20`, 
                                          color: tagItem.tag.color, 
                                          borderColor: tagItem.tag.color 
                                        }}
                                      >
                                        {tagItem.tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleInstructions(ebookPrompt.id, ebookPrompt.includeInstructions)}
                                  className="h-7 px-2"
                                >
                                  <FileText className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSamples(ebookPrompt.id, ebookPrompt.includeSamples)}
                                  className="h-7 px-2"
                                >
                                  <Image className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(ebookPrompt)}
                                  className="h-7 px-2"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Sample Outputs Expansion */}
                            {expandedSamplesId === ebookPrompt.id && ebookPrompt.prompt.sampleOutputs.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50/30 rounded-md p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-medium text-blue-800">📋 Select Individual Samples for Export</h5>
                                  <div className="text-xs text-blue-600">
                                    {ebookPrompt.prompt.sampleOutputs.filter(s => getSampleInclusionState(s.id, s.includeInExport)).length} of {ebookPrompt.prompt.sampleOutputs.length} selected
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {ebookPrompt.prompt.sampleOutputs.map((sample, sampleIndex) => {
                                    const isIncluded = getSampleInclusionState(sample.id, sample.includeInExport)
                                    return (
                                      <div key={sample.id || sampleIndex} className={`flex items-start space-x-3 p-3 rounded-md border-2 transition-colors ${isIncluded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <input
                                          type="checkbox"
                                          checked={isIncluded}
                                          onChange={() => toggleSampleOutputInclusion(sample.id, isIncluded)}
                                          className="mt-1 rounded w-4 h-4"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium text-gray-800">
                                              {sample.title || `Sample ${sampleIndex + 1}`}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 bg-white border rounded">
                                              {sample.outputType}
                                            </span>
                                            {isIncluded && (
                                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                ✓ Will be included
                                              </span>
                                            )}
                                          </div>
                                          {sample.outputType === 'IMAGE' && sample.filePath && (
                                            <div className="mb-2">
                                              <img 
                                                src={sample.filePath} 
                                                alt={sample.title || 'Sample output'}
                                                className="max-w-24 h-auto rounded border-2 border-gray-300"
                                                onError={(e) => {
                                                  const img = e.target as HTMLImageElement
                                                  img.style.display = 'none'
                                                  console.error('Failed to load image:', sample.filePath)
                                                }}
                                              />
                                              <p className="text-xs text-gray-500 mt-1">
                                                Path: {sample.filePath}
                                              </p>
                                            </div>
                                          )}
                                          {sample.content && (
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                              {sample.content.substring(0, 100)}...
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}