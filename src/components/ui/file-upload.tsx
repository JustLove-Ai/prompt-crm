'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, File, Image, Video, FileText } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  filename: string
  originalName: string
  filePath: string
  fileType: string
  size: number
  category: string
}

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void
  onFileRemove: (filename: string) => void
  uploadedFiles: UploadedFile[]
  acceptedTypes?: string
  maxFiles?: number
  disabled?: boolean
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (category: string) => {
  switch (category) {
    case 'images': return <Image className="h-4 w-4" />
    case 'videos': return <Video className="h-4 w-4" />
    case 'documents': return <FileText className="h-4 w-4" />
    default: return <File className="h-4 w-4" />
  }
}

export function FileUpload({
  onFileUpload,
  onFileRemove,
  uploadedFiles,
  acceptedTypes = "image/*,video/*,.pdf",
  maxFiles = 5,
  disabled = false,
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    if (maxFiles < 999 && (uploadedFiles?.length || 0) >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const uploadedFile = await response.json()
        onFileUpload(uploadedFile)
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      await uploadFile(file)
    }
  }, [disabled, uploading, uploadFile])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await uploadFile(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadFile])

  const handleRemoveFile = async (file: UploadedFile) => {
    try {
      const filename = file.filename
      const category = file.category
      
      await fetch(`/api/upload/${filename}?category=${category}`, {
        method: 'DELETE'
      })
      
      onFileRemove(filename)
    } catch (error) {
      console.error('Remove file error:', error)
      alert('Failed to remove file')
    }
  }

  const canUploadMore = maxFiles >= 999 || (uploadedFiles?.length || 0) < maxFiles

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
            disabled ? "cursor-not-allowed opacity-50" : "hover:border-gray-400",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-gray-400">
            Supports images, videos, and PDFs (max 10MB each)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length}{maxFiles < 999 ? `/${maxFiles}` : ''})</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.filename}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.category)}
                <div>
                  <p className="text-sm font-medium truncate max-w-48">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(file)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {maxFiles < 999 && uploadedFiles.length >= maxFiles && (
        <p className="text-sm text-amber-600">
          Maximum number of files reached ({maxFiles})
        </p>
      )}
    </div>
  )
}