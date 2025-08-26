import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const prompt = await prisma.prompt.findUnique({
      where: { id }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Toggle favorite status
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        isFavorite: !prompt.isFavorite
      }
    })

    return NextResponse.json({ 
      success: true, 
      isFavorite: updatedPrompt.isFavorite 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}