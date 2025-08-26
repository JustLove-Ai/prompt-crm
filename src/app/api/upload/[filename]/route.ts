import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = await params
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Extract category and filename from the path
    const urlParams = new URL(request.url).searchParams
    const category = urlParams.get('category')
    
    if (!category) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 })
    }

    const filePath = path.join(UPLOAD_DIR, category, filename)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await unlink(filePath)
    
    return NextResponse.json({ message: 'File deleted successfully' })

  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}