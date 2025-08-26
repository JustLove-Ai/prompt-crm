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
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        prompts: {
          include: {
            prompt: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if another tag with this name exists
    const existingTag = await prisma.tag.findFirst({
      where: { 
        name,
        id: { not: id }
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        color: color || '#10b981'
      },
      include: {
        prompts: {
          include: {
            prompt: true
          }
        }
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    // Check if tag has associated prompts
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        prompts: true
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    if (tag.prompts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag that is used by prompts' },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}