import React from 'react'
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Link,
  Font,
  renderToBuffer
} from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

// Register fonts for better typography (commented out for debugging)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     {
//       src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZs.woff2',
//       fontWeight: 400,
//     },
//     {
//       src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZs.woff2',
//       fontWeight: 600,
//     },
//     {
//       src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZs.woff2',
//       fontWeight: 700,
//     },
//   ],
// })

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1f2937',
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    backgroundColor: '#4f46e5',
    color: 'white',
    minHeight: '100vh',
  },
  coverContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '100vh',
    paddingHorizontal: 50,
    paddingVertical: 60,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 18,
    fontWeight: 400,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 1.4,
  },
  coverAuthor: {
    fontSize: 14,
    fontWeight: 400,
    marginTop: 60,
    textAlign: 'center',
    opacity: 0.8,
  },
  coverImage: {
    maxWidth: 200,
    maxHeight: 200,
    marginBottom: 40,
  },
  pageHeader: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 10,
    borderBottom: '1 solid #e5e7eb',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 15,
    marginTop: 25,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 10,
    marginTop: 20,
  },
  promptType: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '3 8',
    borderRadius: 4,
    marginBottom: 10,
    display: 'flex',
  },
  promptIntro: {
    fontSize: 12,
    color: '#4f46e5',
    fontStyle: 'italic',
    marginBottom: 12,
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 4,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 15,
  },
  instructionsText: {
    fontSize: 11,
    color: '#374151',
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
    fontFamily: 'Helvetica',
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 15,
  },
  promptContent: {
    fontSize: 11,
    color: '#111827',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    fontFamily: 'Courier',
    lineHeight: 1.5,
  },
  samplesLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 15,
  },
  sampleOutput: {
    fontSize: 10,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  sampleTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 5,
  },
  aboutText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  tocTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  tocItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tocDots: {
    flexGrow: 1,
    borderBottom: '1 dotted #d1d5db',
    marginHorizontal: 10,
    marginBottom: 3,
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 9,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '2 6',
    borderRadius: 3,
  },
  divider: {
    marginVertical: 20,
    borderTop: '1 solid #e5e7eb',
  },
})

interface EbookData {
  id: string
  title: string
  subtitle?: string
  author?: string
  coverImage?: string
  aboutText?: string
  includeCategories?: boolean
  includeTags?: boolean
  thankYouTitle?: string
  thankYouMessage?: string
  prompts: {
    id: string
    order: number
    customTitle?: string
    customIntro?: string
    includeInstructions: boolean
    includeSamples: boolean
    prompt: {
      id: string
      title: string
      content: string
      instructions?: string
      promptType: string
      category?: {
        name: string
        color: string
      }
      tags: {
        tag: {
          name: string
          color: string
        }
      }[]
      sampleOutputs: {
        title?: string
        content?: string
        outputType: string
        filePath?: string
        includeInExport?: boolean
      }[]
    }
  }[]
}

// Helper function to convert image to base64 for PDF generation
// React-PDF works better with base64 encoded images
const imageToBase64 = (filePath: string): string => {
  try {
    if (!filePath) return ''
    
    console.log('🖼️ Converting image to base64:', filePath)
    
    let fullPath = ''
    
    // If it starts with /, it's a web path - convert to absolute path
    if (filePath.startsWith('/')) {
      fullPath = path.join(process.cwd(), 'public', filePath)
    } else if (filePath.includes('uploads/')) {
      fullPath = path.join(process.cwd(), 'public', filePath)
    } else {
      // Fallback: assume it's a filename in uploads/images
      const filename = filePath.split(/[\\/]/).pop()
      fullPath = path.join(process.cwd(), 'public', 'uploads', 'images', filename)
    }
    
    console.log('🖼️ Full path for base64:', fullPath)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error('🖼️ File does not exist:', fullPath)
      return ''
    }
    
    // Read file and convert to base64
    const imageBuffer = fs.readFileSync(fullPath)
    const base64Image = imageBuffer.toString('base64')
    
    // Determine mime type based on file extension
    const ext = path.extname(fullPath).toLowerCase()
    let mimeType = 'image/jpeg' // default
    
    if (ext === '.png') mimeType = 'image/png'
    else if (ext === '.gif') mimeType = 'image/gif'
    else if (ext === '.webp') mimeType = 'image/webp'
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg'
    
    const dataUrl = `data:${mimeType};base64,${base64Image}`
    console.log('🖼️ Successfully converted to base64, length:', base64Image.length)
    
    return dataUrl
  } catch (error) {
    console.error('🖼️ Error converting image to base64:', error)
    return ''
  }
}

// Fallback helper function for direct file paths (kept for compatibility)
const resolveImagePath = (filePath: string): string => {
  if (!filePath) return ''
  
  console.log('🖼️ Resolving image path (fallback):', filePath)
  
  // If it starts with /, it's a web path - convert to relative path from project root
  if (filePath.startsWith('/')) {
    const relativePath = `./public${filePath}`
    console.log('🖼️ Converting web path to relative:', relativePath)
    return relativePath
  }
  
  // If it's already a relative path starting with ./public/, use it
  if (filePath.startsWith('./public/')) {
    console.log('🖼️ Using existing relative path:', filePath)
    return filePath
  }
  
  // If it contains uploads/, treat it as a relative path from public
  if (filePath.includes('uploads/')) {
    const relativePath = `./public/${filePath}`
    console.log('🖼️ Converting uploads path to relative:', relativePath)
    return relativePath
  }
  
  // If it's a Windows absolute path, convert to relative
  if (filePath.includes('C:\\') && filePath.includes('uploads\\')) {
    const pathParts = filePath.split('uploads\\')
    if (pathParts.length > 1) {
      const relativePath = `./public/uploads/${pathParts[1].replace(/\\/g, '/')}`
      console.log('🖼️ Converting Windows absolute to relative:', relativePath)
      return relativePath
    }
  }
  
  // Fallback: assume it's a filename in uploads/images
  const filename = filePath.split(/[\\/]/).pop()
  const relativePath = `./public/uploads/images/${filename}`
  console.log('🖼️ Using fallback relative path:', relativePath)
  return relativePath
}

// Helper function to convert markdown to plain text
const convertMarkdownToText = (markdown: string): string => {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/_(.*?)_/g, '$1') // Remove italic markers
    .replace(/^> (.+)$/gm, '• $1') // Convert quotes to bullets
    .replace(/^- (.+)$/gm, '• $1') // Convert lists to bullets
    .replace(/^(\d+)\. (.+)$/gm, '$1. $2') // Keep numbered lists
    .replace(/^## (.+)$/gm, '$1') // Remove heading markers
    .trim()
}

// Helper function to split long text into chunks for better PDF rendering
const splitTextIntoChunks = (text: string, maxLength: number = 1000): string[] => {
  const chunks: string[] = []
  let currentChunk = ''
  
  const sentences = text.split('. ')
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence + '. '
    } else {
      currentChunk += sentence + '. '
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.length > 0 ? chunks : [text]
}

const EbookPDF: React.FC<{ ebook: EbookData }> = ({ ebook }) => {
  const sortedPrompts = [...ebook.prompts].sort((a, b) => a.order - b.order)

  return (
    <Document>
      {/* Cover Page */}
      <Page style={styles.coverPage} wrap={false}>
        <View style={styles.coverContent}>
          {ebook.coverImage && (() => {
            const base64Image = imageToBase64(ebook.coverImage)
            if (base64Image) {
              return (
                <Image 
                  src={base64Image}
                  style={styles.coverImage}
                />
              )
            } else {
              return (
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                  Cover image unavailable
                </Text>
              )
            }
          })()}
          <Text style={styles.coverTitle}>{ebook.title}</Text>
          {ebook.subtitle && (
            <Text style={styles.coverSubtitle}>{ebook.subtitle}</Text>
          )}
          {ebook.author && (
            <Text style={styles.coverAuthor}>by {ebook.author}</Text>
          )}
        </View>
      </Page>

      {/* Table of Contents */}
      <Page style={styles.page}>
        <Text style={styles.pageHeader}>{ebook.title}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber - 1}`} fixed />
        <Text style={styles.tocTitle}>Table of Contents</Text>
        
        {ebook.aboutText && (
          <View style={styles.tocItem}>
            <Text>About</Text>
            <View style={styles.tocDots} />
            <Text>3</Text>
          </View>
        )}
        
        {sortedPrompts.map((ebookPrompt, index) => (
          <View key={ebookPrompt.id} style={styles.tocItem}>
            <Text>
              {index + 1}. {ebookPrompt.customTitle || ebookPrompt.prompt.title}
            </Text>
            <View style={styles.tocDots} />
            <Text>{ebook.aboutText ? index + 4 : index + 3}</Text>
          </View>
        ))}
      </Page>

      {/* About Page */}
      {ebook.aboutText && (
        <Page style={styles.page}>
          <Text style={styles.pageHeader}>{ebook.title}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber - 1}`} fixed />
          <Text style={styles.sectionTitle}>About</Text>
          {splitTextIntoChunks(convertMarkdownToText(ebook.aboutText)).map((chunk, index) => (
            <Text key={index} style={styles.aboutText}>
              {chunk}
            </Text>
          ))}
        </Page>
      )}

      {/* Prompt Pages */}
      {sortedPrompts.map((ebookPrompt, promptIndex) => (
        <Page key={ebookPrompt.id} style={styles.page}>
          <Text style={styles.pageHeader}>{ebook.title}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber - 1}`} fixed />
          
          {/* Chapter Header */}
          <Text style={styles.chapterTitle}>
            Chapter {promptIndex + 1}: {ebookPrompt.customTitle || ebookPrompt.prompt.title}
          </Text>
          
          {/* Prompt Type Badge */}
          {ebook.includeCategories && (
            <Text style={styles.promptType}>
              {ebookPrompt.prompt.promptType}
            </Text>
          )}

          {/* Tags */}
          {ebook.includeTags && ebookPrompt.prompt.tags.length > 0 && (
            <View style={styles.tags}>
              {ebookPrompt.prompt.tags.map((tagItem) => (
                <Text key={tagItem.tag.name} style={styles.tag}>
                  {tagItem.tag.name}
                </Text>
              ))}
            </View>
          )}

          {/* Custom Introduction */}
          {ebookPrompt.customIntro && (
            <Text style={styles.promptIntro}>
              {ebookPrompt.customIntro}
            </Text>
          )}

          {/* Instructions */}
          {ebookPrompt.includeInstructions && ebookPrompt.prompt.instructions && (
            <View>
              <Text style={styles.instructionsLabel}>Instructions</Text>
              {splitTextIntoChunks(ebookPrompt.prompt.instructions).map((chunk, index) => (
                <Text key={index} style={styles.instructionsText}>
                  {chunk}
                </Text>
              ))}
            </View>
          )}

          {/* Prompt Content */}
          <Text style={styles.promptLabel}>Prompt</Text>
          {splitTextIntoChunks(ebookPrompt.prompt.content).map((chunk, index) => (
            <Text key={index} style={styles.promptContent}>
              {chunk}
            </Text>
          ))}

          {/* Sample Outputs */}
          {ebookPrompt.includeSamples && ebookPrompt.prompt.sampleOutputs.filter(sample => sample.includeInExport !== false).length > 0 && (
            <View>
              <Text style={styles.samplesLabel}>Sample Outputs</Text>
              {ebookPrompt.prompt.sampleOutputs.filter(sample => sample.includeInExport !== false).map((sample, sampleIndex) => (
                <View key={sampleIndex} style={styles.sampleOutput}>
                  {sample.title && (
                    <Text style={styles.sampleTitle}>
                      {sample.title}
                    </Text>
                  )}
                  {sample.content && splitTextIntoChunks(sample.content, 500).map((chunk, chunkIndex) => (
                    <Text key={chunkIndex}>
                      {chunk}
                    </Text>
                  ))}
                  {sample.outputType === 'IMAGE' && sample.filePath && (
                    <View>
                      <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 5 }}>
                        📎 Image: {sample.filePath.split('/').pop()}
                      </Text>
                      {(() => {
                        const base64Image = imageToBase64(sample.filePath)
                        if (base64Image) {
                          return (
                            <Image 
                              src={base64Image}
                              style={{ 
                                maxWidth: 300, 
                                maxHeight: 200, 
                                marginVertical: 10,
                                objectFit: 'contain'
                              }}
                            />
                          )
                        } else {
                          return (
                            <Text style={{ fontSize: 9, color: '#ef4444', fontStyle: 'italic' }}>
                              ⚠️ Image could not be loaded: {sample.filePath}
                            </Text>
                          )
                        }
                      })()}
                    </View>
                  )}
                  {sample.outputType !== 'IMAGE' && sample.filePath && !sample.content && (
                    <Text style={{ fontSize: 9, color: '#6b7280' }}>
                      📎 Attachment: {sample.filePath.split('/').pop()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Add some spacing between prompts */}
          {promptIndex < sortedPrompts.length - 1 && (
            <View style={styles.divider} />
          )}
        </Page>
      ))}

      {/* Back Cover (Optional) */}
      <Page style={styles.coverPage} wrap={false}>
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>
            {ebook.thankYouTitle || 'Thank You'}
          </Text>
          {ebook.thankYouMessage && (
            <Text style={styles.coverSubtitle}>
              {convertMarkdownToText(ebook.thankYouMessage)}
            </Text>
          )}
          <Text style={styles.coverAuthor}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateEbookPDF(ebook: EbookData): Promise<Buffer> {
  try {
    console.log('📄 Starting PDF generation for:', ebook.title)
    console.log('📄 Prompts count:', ebook.prompts.length)
    
    const doc = <EbookPDF ebook={ebook} />
    console.log('📄 React PDF document created successfully')
    
    const pdfBuffer = await renderToBuffer(doc)
    console.log('📄 PDF buffer generated, size:', pdfBuffer.length, 'bytes')
    
    return pdfBuffer
  } catch (error) {
    console.error('📄 PDF generation failed:', error)
    if (error instanceof Error) {
      console.error('📄 Error message:', error.message)
      console.error('📄 Error stack:', error.stack)
    }
    throw error
  }
}