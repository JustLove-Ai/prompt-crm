'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export interface TagFormData {
  name: string
  color?: string
}

export async function getTags() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        prompts: {
          include: {
            prompt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: tags }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return { success: false, error: 'Failed to fetch tags' }
  }
}

export async function getTagById(id: string) {
  try {
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
      return { success: false, error: 'Tag not found' }
    }
    
    return { success: true, data: tag }
  } catch (error) {
    console.error('Failed to fetch tag:', error)
    return { success: false, error: 'Failed to fetch tag' }
  }
}

export async function createTag(formData: TagFormData) {
  try {
    if (!formData.name) {
      return { success: false, error: 'Name is required' }
    }

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: formData.name }
    })

    if (existingTag) {
      return { success: false, error: 'Tag with this name already exists' }
    }

    const tag = await prisma.tag.create({
      data: {
        name: formData.name,
        color: formData.color || '#10b981'
      },
      include: {
        prompts: {
          include: {
            prompt: true
          }
        }
      }
    })

    revalidatePath('/tags')
    return { success: true, data: tag }
  } catch (error) {
    console.error('Failed to create tag:', error)
    return { success: false, error: 'Failed to create tag' }
  }
}

export async function updateTag(id: string, formData: TagFormData) {
  try {
    if (!formData.name) {
      return { success: false, error: 'Name is required' }
    }

    // Check if another tag already exists with this name
    const existingTag = await prisma.tag.findUnique({
      where: { name: formData.name }
    })

    if (existingTag && existingTag.id !== id) {
      return { success: false, error: 'Tag with this name already exists' }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: formData.name,
        color: formData.color
      },
      include: {
        prompts: {
          include: {
            prompt: true
          }
        }
      }
    })

    revalidatePath('/tags')
    revalidatePath(`/tags/${id}`)
    return { success: true, data: tag }
  } catch (error) {
    console.error('Failed to update tag:', error)
    return { success: false, error: 'Failed to update tag' }
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({
      where: { id }
    })

    revalidatePath('/tags')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete tag:', error)
    return { success: false, error: 'Failed to delete tag' }
  }
}

export async function redirectToTag(id: string) {
  redirect(`/tags/${id}`)
}

export async function redirectToTags() {
  redirect('/tags')
}