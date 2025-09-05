'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function updateSampleOutputExportStatus(id: string, includeInExport: boolean) {
  try {
    const sampleOutput = await prisma.sampleOutput.update({
      where: { id },
      data: { includeInExport },
    })

    // Revalidate all related paths
    revalidatePath('/prompts')
    revalidatePath('/exports')
    
    return {
      success: true,
      data: sampleOutput
    }
  } catch (error) {
    console.error('Failed to update sample output:', error)
    return { 
      success: false, 
      error: 'Failed to update sample output' 
    }
  }
}

export async function getSampleOutput(id: string) {
  try {
    const sampleOutput = await prisma.sampleOutput.findUnique({
      where: { id },
      include: {
        prompt: true
      }
    })

    if (!sampleOutput) {
      return { success: false, error: 'Sample output not found' }
    }

    return { success: true, data: sampleOutput }
  } catch (error) {
    console.error('Failed to fetch sample output:', error)
    return { success: false, error: 'Failed to fetch sample output' }
  }
}

export async function deleteSampleOutput(id: string) {
  try {
    const sampleOutput = await prisma.sampleOutput.findUnique({
      where: { id },
      select: { promptId: true }
    })

    if (!sampleOutput) {
      return { success: false, error: 'Sample output not found' }
    }

    await prisma.sampleOutput.delete({
      where: { id }
    })

    // Revalidate relevant paths
    revalidatePath('/prompts')
    revalidatePath(`/prompts/${sampleOutput.promptId}`)
    revalidatePath('/exports')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete sample output:', error)
    return { success: false, error: 'Failed to delete sample output' }
  }
}