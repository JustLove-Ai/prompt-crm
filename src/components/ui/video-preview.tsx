'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './dialog'
import { Button } from './button'
import { Play, Pause, Volume2, VolumeX, Maximize, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPreviewProps {
  src: string
  filename?: string
  onRemove?: () => void
  className?: string
  thumbnailSize?: 'sm' | 'md' | 'lg'
  showControls?: boolean
  autoPlay?: boolean
}

const thumbnailSizes = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
}

export function VideoPreview({
  src,
  filename,
  onRemove,
  className,
  thumbnailSize = 'md',
  showControls = true,
  autoPlay = false
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = filename || 'video'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (videoError) {
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
            <video
              src={src}
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
              muted
            />
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <Play className="h-8 w-8 text-white" />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
              <Maximize className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </DialogTrigger>

        {/* Full size video dialog */}
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={src}
              className="w-full h-auto max-h-[80vh]"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setVideoError(true)}
              autoPlay={autoPlay}
              muted={isMuted}
            />
            
            {/* Video controls overlay */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                {/* Progress bar */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #6b7280 ${(currentTime / duration) * 100}%, #6b7280 100%)`
                    }}
                  />
                </div>
                
                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            
            {filename && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
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