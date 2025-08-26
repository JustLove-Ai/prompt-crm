import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEbookPDF } from '@/lib/pdf-generator'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the ebook data with all relations
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
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      )
    }

    // Transform the data to match the PDF generator interface
    const ebookData = {
      id: ebook.id,
      title: ebook.title,
      subtitle: ebook.subtitle || undefined,
      author: ebook.author || undefined,
      coverImage: ebook.coverImage || undefined,
      aboutText: ebook.aboutText || undefined,
      includeCategories: ebook.includeCategories ?? false,
      includeTags: ebook.includeTags ?? false, 
      thankYouTitle: ebook.thankYouTitle || 'Thank You',
      thankYouMessage: ebook.thankYouMessage || undefined,
      prompts: ebook.prompts.map(ep => ({
        id: ep.id,
        order: ep.order,
        customTitle: ep.customTitle || undefined,
        customIntro: ep.customIntro || undefined,
        includeInstructions: ep.includeInstructions,
        includeSamples: ep.includeSamples,
        prompt: {
          id: ep.prompt.id,
          title: ep.prompt.title,
          content: ep.prompt.content,
          instructions: ep.prompt.instructions || undefined,
          promptType: ep.prompt.promptType,
          category: ep.prompt.category ? {
            name: ep.prompt.category.name,
            color: ep.prompt.category.color
          } : undefined,
          tags: ep.prompt.tags.map(pt => ({
            tag: {
              name: pt.tag.name,
              color: pt.tag.color
            }
          })),
          sampleOutputs: ep.prompt.sampleOutputs.map(so => ({
            title: so.title || undefined,
            content: so.content || undefined,
            outputType: so.outputType,
            filePath: so.filePath || undefined,
            includeInExport: so.includeInExport
          }))
        }
      }))
    }

    // Generate the PDF
    const pdfBuffer = await generateEbookPDF(ebookData)

    // Update the ebook status to EXPORTED
    await prisma.ebookExport.update({
      where: { id },
      data: { status: 'EXPORTED' }
    })

    // Create a safe filename
    const safeTitle = ebook.title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()

    // Return the PDF as a response
    return new NextResponse(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}