'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createEbookExport(promptIds: string[], title?: string, subtitle?: string, author?: string) {
  try {
    if (!promptIds || !Array.isArray(promptIds) || promptIds.length === 0) {
      throw new Error('At least one prompt ID is required')
    }

    // Verify all prompts exist
    const prompts = await prisma.prompt.findMany({
      where: {
        id: { in: promptIds }
      },
      select: { id: true, title: true }
    })

    if (prompts.length !== promptIds.length) {
      throw new Error('One or more prompts not found')
    }

    // Create the ebook export
    const ebook = await prisma.ebookExport.create({
      data: {
        title: title || `Prompt Collection - ${new Date().toLocaleDateString()}`,
        subtitle,
        author,
        prompts: {
          create: promptIds.map((promptId: string, index: number) => ({
            promptId,
            order: index,
          }))
        }
      },
      include: {
        prompts: {
          include: {
            prompt: {
              include: {
                category: true,
                tags: {
                  include: {
                    tag: true
                  }
                },
                sampleOutputs: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        customPages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    revalidatePath('/exports')
    return { success: true, data: ebook }
  } catch (error) {
    console.error('Export creation error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create export' 
    }
  }
}

export async function getEbookExport(id: string) {
  try {
    const ebook = await prisma.ebookExport.findUnique({
      where: { id },
      include: {
        prompts: {
          include: {
            prompt: {
              include: {
                category: true,
                tags: {
                  include: {
                    tag: true
                  }
                },
                sampleOutputs: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        customPages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!ebook) {
      return { success: false, error: 'Ebook not found' }
    }

    return { success: true, data: ebook }
  } catch (error) {
    console.error('Export fetch error:', error)
    return { 
      success: false, 
      error: 'Failed to fetch export' 
    }
  }
}

export async function getAllEbookExports() {
  try {
    const ebooks = await prisma.ebookExport.findMany({
      include: {
        prompts: {
          include: {
            prompt: {
              select: {
                id: true,
                title: true,
                promptType: true
              }
            }
          }
        },
        _count: {
          select: {
            prompts: true,
            customPages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return { success: true, data: ebooks }
  } catch (error) {
    console.error('Export fetch error:', error)
    return { 
      success: false, 
      error: 'Failed to fetch exports' 
    }
  }
}

export async function updateEbookExport(
  id: string, 
  updates: {
    title?: string
    subtitle?: string
    author?: string
    coverImage?: string
    aboutText?: string
    includeCategories?: boolean
    includeTags?: boolean
    thankYouTitle?: string
    thankYouMessage?: string
    status?: 'DRAFT' | 'READY' | 'EXPORTED'
  }
) {
  try {
    console.log('📝 updateEbookExport called with id:', id, 'updates:', updates)
    
    // Temporarily exclude the new fields until Prisma client is regenerated
    const { thankYouTitle, thankYouMessage, includeCategories, includeTags, ...safeUpdates } = updates
    
    const ebook = await prisma.ebookExport.update({
      where: { id },
      data: safeUpdates,
      include: {
        prompts: {
          include: {
            prompt: {
              include: {
                category: true,
                tags: {
                  include: {
                    tag: true
                  }
                },
                sampleOutputs: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        customPages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    console.log('📝 Ebook updated successfully')
    revalidatePath(`/exports/${id}/edit`)
    return { success: true, data: ebook }
  } catch (error) {
    console.error('📝 Export update error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update export' 
    }
  }
}

export async function updateEbookPromptOrder(ebookId: string, promptUpdates: { id: string; order: number }[]) {
  try {
    // Update each prompt's order
    await Promise.all(
      promptUpdates.map(({ id, order }) =>
        prisma.ebookPrompt.update({
          where: { id },
          data: { order }
        })
      )
    )

    revalidatePath(`/exports/${ebookId}/edit`)
    return { success: true }
  } catch (error) {
    console.error('Prompt order update error:', error)
    return { 
      success: false, 
      error: 'Failed to update prompt order' 
    }
  }
}

export async function updateEbookPrompt(
  id: string,
  updates: {
    customTitle?: string
    customIntro?: string
    includeInstructions?: boolean
    includeSamples?: boolean
  }
) {
  try {
    const prompt = await prisma.ebookPrompt.update({
      where: { id },
      data: updates
    })

    revalidatePath(`/exports/${prompt.ebookId}/edit`)
    return { success: true, data: prompt }
  } catch (error) {
    console.error('Ebook prompt update error:', error)
    return { 
      success: false, 
      error: 'Failed to update ebook prompt' 
    }
  }
}

export async function createEbookPage(
  ebookId: string,
  data: {
    title?: string
    content: string
    order: number
    pageType: 'TEXT' | 'IMAGE' | 'DIVIDER' | 'COVER' | 'ABOUT'
    imageUrl?: string
  }
) {
  try {
    const page = await prisma.ebookPage.create({
      data: {
        ...data,
        ebookId
      }
    })

    revalidatePath(`/exports/${ebookId}/edit`)
    return { success: true, data: page }
  } catch (error) {
    console.error('Ebook page creation error:', error)
    return { 
      success: false, 
      error: 'Failed to create ebook page' 
    }
  }
}

export async function updateEbookPage(
  id: string,
  updates: {
    title?: string
    content?: string
    order?: number
    pageType?: 'TEXT' | 'IMAGE' | 'DIVIDER' | 'COVER' | 'ABOUT'
    imageUrl?: string
  }
) {
  try {
    const page = await prisma.ebookPage.update({
      where: { id },
      data: updates
    })

    revalidatePath(`/exports/${page.ebookId}/edit`)
    return { success: true, data: page }
  } catch (error) {
    console.error('Ebook page update error:', error)
    return { 
      success: false, 
      error: 'Failed to update ebook page' 
    }
  }
}

export async function deleteEbookPage(id: string) {
  try {
    const page = await prisma.ebookPage.findUnique({
      where: { id },
      select: { ebookId: true }
    })

    if (!page) {
      return { success: false, error: 'Page not found' }
    }

    await prisma.ebookPage.delete({
      where: { id }
    })

    revalidatePath(`/exports/${page.ebookId}/edit`)
    return { success: true }
  } catch (error) {
    console.error('Ebook page deletion error:', error)
    return { 
      success: false, 
      error: 'Failed to delete ebook page' 
    }
  }
}

// Note: This would require adding includeInExport field to SampleOutput schema
// For now, this functionality is handled in the UI state only
export async function updateSampleOutputInclusion(
  sampleOutputId: string,
  includeInExport: boolean,
  ebookId: string
) {
  try {
    // This is a placeholder - would need schema migration to implement properly
    // For testing, we'll manage this in the UI state only
    console.log('Sample output inclusion update (placeholder):', { sampleOutputId, includeInExport })
    return { success: true }
  } catch (error) {
    console.error('Sample output update error:', error)
    return { 
      success: false, 
      error: 'Failed to update sample output inclusion' 
    }
  }
}

export async function deleteEbookExport(id: string) {
  try {
    await prisma.ebookExport.delete({
      where: { id }
    })

    revalidatePath('/exports')
    return { success: true }
  } catch (error) {
    console.error('Export deletion error:', error)
    return { 
      success: false, 
      error: 'Failed to delete export' 
    }
  }
}