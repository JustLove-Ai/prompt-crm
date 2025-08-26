export const ALLOWED_FILE_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  videos: {
    extensions: ['.mp4', '.webm', '.mov'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  documents: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024 // 10MB
  }
}

export function validateFile(file: File): { valid: boolean; error?: string; category?: string } {
  // Check file size
  const maxSize = Math.max(
    ALLOWED_FILE_TYPES.images.maxSize,
    ALLOWED_FILE_TYPES.videos.maxSize,
    ALLOWED_FILE_TYPES.documents.maxSize
  )
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' }
  }

  // Determine file category
  let category: string | null = null
  for (const [cat, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (config.mimeTypes.includes(file.type)) {
      category = cat
      break
    }
  }

  if (!category) {
    return { 
      valid: false, 
      error: 'Unsupported file type. Supported: images (jpg, png, gif, webp), videos (mp4, webm, mov), documents (pdf)' 
    }
  }

  // Check category-specific size limits
  const categoryConfig = ALLOWED_FILE_TYPES[category as keyof typeof ALLOWED_FILE_TYPES]
  if (file.size > categoryConfig.maxSize) {
    const maxSizeMB = Math.round(categoryConfig.maxSize / (1024 * 1024))
    return { valid: false, error: `${category} files must be under ${maxSizeMB}MB` }
  }

  return { valid: true, category }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'))
}

export function isImageFile(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.images.mimeTypes.includes(mimeType)
}

export function isVideoFile(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.videos.mimeTypes.includes(mimeType)
}

export function isDocumentFile(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.documents.mimeTypes.includes(mimeType)
}

export async function deleteUploadedFile(filePath: string, category: string): Promise<boolean> {
  try {
    const filename = filePath.split('/').pop()
    if (!filename) return false

    const response = await fetch(`/api/upload/${filename}?category=${category}`, {
      method: 'DELETE'
    })
    
    return response.ok
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}