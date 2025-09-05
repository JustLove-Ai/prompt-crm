'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export interface SampleOutputData {
  title?: string
  content?: string
  filePath?: string
  fileType?: string
  outputType?: 'TEXT' | 'IMAGE' | 'FILE'
  includeInExport?: boolean
}

export interface PromptFormData {
  title: string
  content: string
  instructions?: string
  sections?: Record<string, unknown>
  promptType?: 'CODE' | 'IMAGE' | 'BUSINESS' | 'TECHNICAL' | 'CREATIVE' | 'ANALYSIS' | 'MARKETING' | 'OTHER'
  categoryId?: string
  tagIds?: string[]
  sampleOutputs?: SampleOutputData[]
  isFavorite?: boolean
}

export async function getPrompts() {
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
    return { success: true, data: prompts }
  } catch (error) {
    console.error('Failed to fetch prompts:', error)
    return { success: false, error: 'Failed to fetch prompts' }
  }
}

export async function getPromptById(id: string) {
  try {
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
      return { success: false, error: 'Prompt not found' }
    }
    
    return { success: true, data: prompt }
  } catch (error) {
    console.error('Failed to fetch prompt:', error)
    return { success: false, error: 'Failed to fetch prompt' }
  }
}

export async function createPrompt(formData: PromptFormData) {
  try {
    if (!formData.title || !formData.content) {
      return { success: false, error: 'Title and content are required' }
    }

    // Create the prompt
    const prompt = await prisma.prompt.create({
      data: {
        title: formData.title,
        content: formData.content,
        instructions: formData.instructions,
        sections: formData.sections ? JSON.stringify(formData.sections) : null,
        promptType: formData.promptType || 'OTHER',
        categoryId: formData.categoryId || null,
        isFavorite: formData.isFavorite || false
      }
    })

    // Add tags if provided
    if (formData.tagIds && formData.tagIds.length > 0) {
      await prisma.promptTag.createMany({
        data: formData.tagIds.map((tagId: string) => ({
          promptId: prompt.id,
          tagId
        }))
      })
    }

    // Add sample outputs if provided
    if (formData.sampleOutputs && formData.sampleOutputs.length > 0) {
      await prisma.sampleOutput.createMany({
        data: formData.sampleOutputs.map((output: SampleOutputData) => ({
          promptId: prompt.id,
          title: output.title,
          content: output.content,
          filePath: output.filePath,
          fileType: output.fileType,
          outputType: output.outputType || 'TEXT',
          includeInExport: output.includeInExport ?? true
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

    revalidatePath('/prompts')
    return { success: true, data: completePrompt }
  } catch (error) {
    console.error('Failed to create prompt:', error)
    return { success: false, error: 'Failed to create prompt' }
  }
}

export async function updatePrompt(id: string, formData: PromptFormData) {
  try {
    if (!formData.title || !formData.content) {
      return { success: false, error: 'Title and content are required' }
    }

    // Update the prompt
    await prisma.prompt.update({
      where: { id },
      data: {
        title: formData.title,
        content: formData.content,
        instructions: formData.instructions,
        sections: formData.sections ? JSON.stringify(formData.sections) : null,
        promptType: formData.promptType || 'OTHER',
        categoryId: formData.categoryId || null,
        isFavorite: formData.isFavorite || false
      }
    })

    // Update tags - remove existing and add new ones
    await prisma.promptTag.deleteMany({
      where: { promptId: id }
    })

    if (formData.tagIds && formData.tagIds.length > 0) {
      await prisma.promptTag.createMany({
        data: formData.tagIds.map((tagId: string) => ({
          promptId: id,
          tagId
        }))
      })
    }

    // Update sample outputs - remove existing and add new ones
    await prisma.sampleOutput.deleteMany({
      where: { promptId: id }
    })

    if (formData.sampleOutputs && formData.sampleOutputs.length > 0) {
      await prisma.sampleOutput.createMany({
        data: formData.sampleOutputs.map((output: SampleOutputData) => ({
          promptId: id,
          title: output.title,
          content: output.content,
          filePath: output.filePath,
          fileType: output.fileType,
          outputType: output.outputType || 'TEXT',
          includeInExport: output.includeInExport ?? true
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

    revalidatePath('/prompts')
    revalidatePath(`/prompts/${id}`)
    return { success: true, data: updatedPrompt }
  } catch (error) {
    console.error('Failed to update prompt:', error)
    return { success: false, error: 'Failed to update prompt' }
  }
}

export async function deletePrompt(id: string) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id }
    })

    if (!prompt) {
      return { success: false, error: 'Prompt not found' }
    }

    // Delete related records first (handled by cascade in schema, but being explicit)
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

    revalidatePath('/prompts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete prompt:', error)
    return { success: false, error: 'Failed to delete prompt' }
  }
}

export async function togglePromptFavorite(id: string) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id }
    })

    if (!prompt) {
      return { success: false, error: 'Prompt not found' }
    }

    // Toggle favorite status
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        isFavorite: !prompt.isFavorite
      }
    })

    revalidatePath('/prompts')
    revalidatePath(`/prompts/${id}`)
    return { 
      success: true, 
      data: { isFavorite: updatedPrompt.isFavorite }
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    return { success: false, error: 'Failed to toggle favorite' }
  }
}

export async function redirectToPrompt(id: string) {
  redirect(`/prompts/${id}`)
}

export async function redirectToPrompts() {
  redirect('/prompts')
}