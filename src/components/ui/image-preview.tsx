'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './dialog'
import { Button } from './button'
import { Expand, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImagePreviewProps {
  src: string
  alt: string
  filename?: string
  onRemove?: () => void
  className?: string
  thumbnailSize?: 'sm' | 'md' | 'lg'
  showControls?: boolean
}

const thumbnailSizes = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32'
}

export function ImagePreview({
  src,
  alt,
  filename,
  onRemove,
  className,
  thumbnailSize = 'md',
  showControls = true
}: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = filename || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (imageError) {
    return (
      <div className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50",
        thumbnailSizes[thumbnailSize],
        className
      )}>
        <div className="text-center">
          <X className="h-6 w-6 mx-auto text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Thumbnail */}
      <Dialog>
        <DialogTrigger asChild>
          <div className={cn(
            "relative cursor-pointer overflow-hidden rounded-lg border bg-gray-100",
            thumbnailSizes[thumbnailSize]
          )}>
            <Image
              src={src}
              alt={alt}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, 200px"
            />
            
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <div className="h-6 w-6 bg-gray-300 rounded" />
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Expand className="h-5 w-5 text-white" />
            </div>
          </div>
        </DialogTrigger>

        {/* Full size preview dialog */}
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            <Image
              src={src}
              alt={alt}
              width={800}
              height={600}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={() => setImageError(true)}
            />
            
            {/* Controls overlay */}
            {showControls && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {filename && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                {filename}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove button */}
      {onRemove && showControls && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}