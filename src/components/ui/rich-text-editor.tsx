'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Quote,
  Type
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  className = "",
  readOnly = false
}: RichTextEditorProps) {
  // DEBUG: This should show in console if new component loads
  console.log('🔥 NEW RichTextEditor loaded - React 19 compatible!')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0, text: '' }
    
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
    }
  }

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const selection = getSelection()
    const textToWrap = selection.text || placeholder
    const newText = before + textToWrap + after
    
    const beforeText = value.substring(0, selection.start)
    const afterText = value.substring(selection.end)
    const fullText = beforeText + newText + afterText
    
    onChange(fullText)
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = selection.start + before.length + textToWrap.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatBold = () => insertText('**', '**', 'bold text')
  const formatItalic = () => insertText('_', '_', 'italic text')
  const formatQuote = () => insertText('\n> ', '', 'Quote text')
  const formatList = () => insertText('\n- ', '', 'List item')
  const formatOrderedList = () => insertText('\n1. ', '', 'List item')
  const formatHeading = () => insertText('\n## ', '', 'Heading')

  // Convert markdown-like syntax to display HTML for preview
  const getPreviewHTML = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\n/g, '<br/>')
  }

  if (readOnly) {
    return (
      <div 
        className={`${className} border rounded p-4 bg-gray-50 min-h-32`}
        dangerouslySetInnerHTML={{ __html: getPreviewHTML(value) }}
      />
    )
  }

  return (
    <div className={`${className}`}>
      {/* Toolbar */}
      <div className="border border-b-0 rounded-t p-2 bg-gray-50 flex items-center space-x-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHeading}
          className="h-8 w-8 p-0"
          title="Heading"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBold}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatItalic}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-gray-300" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatList}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatOrderedList}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatQuote}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-32 p-4 border border-t-0 rounded-b focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
      />

      {/* Helper Text */}
      <div className="text-xs text-gray-500 mt-1">
        Use **bold**, _italic_, &gt; quotes, - lists, ## headings
      </div>
    </div>
  )
}

// Simple text-only editor for basic content
interface SimpleTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function SimpleTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  rows = 3,
  className = ""
}: SimpleTextEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${className}`}
    />
  )
}