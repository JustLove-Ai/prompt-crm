import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'],
  documents: ['application/pdf']
}

function getFileCategory(mimeType: string): string | null {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) {
      return category
    }
  }
  return null
}

function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, extension)
  return `${nameWithoutExt}_${timestamp}_${random}${extension}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB.' }, { status: 400 })
    }

    // Validate file type
    const category = getFileCategory(file.type)
    if (!category) {
      return NextResponse.json({ 
        error: 'Invalid file type. Supported: images (jpg, png, gif, webp), videos (mp4, webm, mov), documents (pdf)' 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadPath = path.join(UPLOAD_DIR, category)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filePath = path.join(uploadPath, filename)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const publicPath = `/uploads/${category}/${filename}`
    
    return NextResponse.json({
      filename,
      originalName: file.name,
      filePath: publicPath,
      fileType: file.type,
      size: file.size,
      category
    })

  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}