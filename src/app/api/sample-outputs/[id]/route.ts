import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { includeInExport } = body

    const sampleOutput = await prisma.sampleOutput.update({
      where: { id },
      data: { includeInExport },
    })

    return NextResponse.json({
      success: true,
      data: sampleOutput
    })
  } catch (error) {
    console.error('Failed to update sample output:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update sample output' },
      { status: 500 }
    )
  }
}