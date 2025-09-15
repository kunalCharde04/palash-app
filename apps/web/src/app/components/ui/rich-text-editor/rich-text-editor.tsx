"use client"

import { useState, useRef, useEffect } from 'react'
import { PrimaryButton as Button } from '../buttons/PrimaryButton'
import { 
  Bold, 
  Italic, 
  List,
  ListOrdered,
  Undo,
  Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  className,
  error = false 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const saveToHistory = (content: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(content)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const execCommand = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      // Save current state before making changes
      const currentContent = editorRef.current.innerHTML
      
      try {
        const success = document.execCommand(command, false, '')
        if (success) {
          // Force update immediately
          setTimeout(() => {
            const newContent = editorRef.current?.innerHTML || ''
            if (newContent !== currentContent) {
              saveToHistory(newContent)
              updateContent()
            }
          }, 10)
        } else {
          // Fallback for unsupported commands
          handleManualFormatting(command)
        }
      } catch (error) {
        console.warn('Command failed, using manual formatting:', error)
        handleManualFormatting(command)
      }
    }
  }

  const handleManualFormatting = (command: string) => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString()

    if (command === 'bold') {
      const strong = document.createElement('strong')
      if (selectedText) {
        strong.textContent = selectedText
        range.deleteContents()
        range.insertNode(strong)
      } else {
        strong.innerHTML = '<br>'
        range.insertNode(strong)
        range.setStartAfter(strong)
        range.setEndAfter(strong)
      }
    } else if (command === 'italic') {
      const em = document.createElement('em')
      if (selectedText) {
        em.textContent = selectedText
        range.deleteContents()
        range.insertNode(em)
      } else {
        em.innerHTML = '<br>'
        range.insertNode(em)
        range.setStartAfter(em)
        range.setEndAfter(em)
      }
    } else if (command === 'insertUnorderedList') {
      insertList('ul')
    } else if (command === 'insertOrderedList') {
      insertList('ol')
    }

    selection.removeAllRanges()
    selection.addRange(range)
    updateContent()
  }

  const insertList = (listType: 'ul' | 'ol') => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const list = document.createElement(listType)
    const listItem = document.createElement('li')
    
    // Get the current line or selected text
    const selectedText = selection.toString().trim()
    if (selectedText) {
      listItem.textContent = selectedText
      range.deleteContents()
    } else {
      listItem.innerHTML = '&nbsp;' // Use non-breaking space to ensure the list item is visible
    }
    
    list.appendChild(listItem)
    range.insertNode(list)
    
    // Position cursor inside the list item
    const newRange = document.createRange()
    newRange.setStart(listItem, 0)
    newRange.setEnd(listItem, 0)
    selection.removeAllRanges()
    selection.addRange(newRange)
    
    // Force immediate update
    updateContent()
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1)
      if (editorRef.current) {
        editorRef.current.innerHTML = history[historyIndex - 1]
        onChange(history[historyIndex - 1])
      }
    }
  }

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1)
      if (editorRef.current) {
        editorRef.current.innerHTML = history[historyIndex + 1]
        onChange(history[historyIndex + 1])
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key in lists
    if (e.key === 'Enter') {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const listItem = range.startContainer.parentElement?.closest('li')
        
        if (listItem) {
          e.preventDefault()
          const newListItem = document.createElement('li')
          newListItem.innerHTML = '&nbsp;'
          listItem.parentNode?.insertBefore(newListItem, listItem.nextSibling)
          
          const newRange = document.createRange()
          newRange.setStart(newListItem, 0)
          newRange.setEnd(newListItem, 0)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          updateContent()
        }
      }
    }
  }

  const handleInput = () => {
    updateContent()
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', error && 'border-red-500', className)}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef}
        contentEditable
        className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 focus:outline-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        [contenteditable] ol {
          list-style-type: decimal;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
          display: list-item;
        }
        [contenteditable] strong {
          font-weight: 600;
        }
        [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] li:empty:before {
          content: "\\00a0";
        }
      `}</style>
    </div>
  )
}