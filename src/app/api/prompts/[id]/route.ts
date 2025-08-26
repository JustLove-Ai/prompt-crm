import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        sampleOutputs: true
      }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(prompt)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      title, 
      content, 
      instructions, 
      promptType, 
      categoryId, 
      tagIds, 
      sampleOutputs,
      isFavorite 
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Update the prompt
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        title,
        content,
        instructions,
        promptType: promptType || 'OTHER',
        categoryId: categoryId || null,
        isFavorite: isFavorite || false
      }
    })

    // Update tags - remove existing and add new ones
    await prisma.promptTag.deleteMany({
      where: { promptId: id }
    })

    if (tagIds && tagIds.length > 0) {
      await prisma.promptTag.createMany({
        data: tagIds.map((tagId: string) => ({
          promptId: id,
          tagId
        }))
      })
    }

    // Update sample outputs - remove existing and add new ones
    await prisma.sampleOutput.deleteMany({
      where: { promptId: id }
    })

    if (sampleOutputs && sampleOutputs.length > 0) {
      await prisma.sampleOutput.createMany({
        data: sampleOutputs.map((output: any) => ({
          promptId: id,
          title: output.title,
          content: output.content,
          filePath: output.filePath,
          fileType: output.fileType,
          outputType: output.outputType || 'TEXT'
        }))
      })
    }

    // Fetch the complete updated prompt
    const updatedPrompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        sampleOutputs: true
      }
    })

    return NextResponse.json(updatedPrompt)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Delete related records first
    await prisma.sampleOutput.deleteMany({
      where: { promptId: id }
    })

    await prisma.promptTag.deleteMany({
      where: { promptId: id }
    })

    // Delete the prompt
    await prisma.prompt.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}