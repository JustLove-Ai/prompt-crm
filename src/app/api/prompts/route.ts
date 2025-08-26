import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        sampleOutputs: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(prompts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      content, 
      instructions, 
      sections,
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

    // Create the prompt
    const prompt = await prisma.prompt.create({
      data: {
        title,
        content,
        instructions,
        sections: sections ? JSON.stringify(sections) : null,
        promptType: promptType || 'OTHER',
        categoryId: categoryId || null,
        isFavorite: isFavorite || false
      }
    })

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await prisma.promptTag.createMany({
        data: tagIds.map((tagId: string) => ({
          promptId: prompt.id,
          tagId
        }))
      })
    }

    // Add sample outputs if provided
    if (sampleOutputs && sampleOutputs.length > 0) {
      await prisma.sampleOutput.createMany({
        data: sampleOutputs.map((output: any) => ({
          promptId: prompt.id,
          title: output.title,
          content: output.content,
          filePath: output.filePath,
          fileType: output.fileType,
          outputType: output.outputType || 'TEXT'
        }))
      })
    }

    // Fetch the complete prompt with relations
    const completePrompt = await prisma.prompt.findUnique({
      where: { id: prompt.id },
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

    return NextResponse.json(completePrompt, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}