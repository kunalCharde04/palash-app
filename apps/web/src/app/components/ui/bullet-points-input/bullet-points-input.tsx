"use client"

import { useState, useRef } from 'react'
import { PrimaryButton as Button } from '../buttons/PrimaryButton'
import { Input } from '../input/input'
import { Plus, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulletPointsInputProps {
  value: string[]
  onChange: (points: string[]) => void
  placeholder?: string
  className?: string
  error?: boolean
  maxPoints?: number
}

export function BulletPointsInput({ 
  value = [], 
  onChange, 
  placeholder = "Add a bullet point...", 
  className,
  error = false,
  maxPoints = 10
}: BulletPointsInputProps) {
  const [newPoint, setNewPoint] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addPoint = () => {
    const trimmedPoint = newPoint.trim()
    if (trimmedPoint && value.length < maxPoints) {
      onChange([...value, trimmedPoint])
      setNewPoint('')
      inputRef.current?.focus()
    }
  }

  const removePoint = (index: number) => {
    const newPoints = value.filter((_, i) => i !== index)
    onChange(newPoints)
  }

  const updatePoint = (index: number, newValue: string) => {
    const newPoints = [...value]
    newPoints[index] = newValue
    onChange(newPoints)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPoint()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Input for adding new points */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={cn(error && 'border-red-500')}
        />
        <Button
          type="button"
          onClick={addPoint}
          disabled={!newPoint.trim() || value.length >= maxPoints}
          className="px-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Display existing points */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 mb-2">
            {value.length} point{value.length !== 1 ? 's' : ''} added
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {value.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
              >
                <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <Input
                    value={point}
                    onChange={(e) => updatePoint(index, e.target.value)}
                    className="border-0 bg-transparent p-0 focus:ring-0"
                    placeholder="Enter bullet point..."
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePoint(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="text-xs text-gray-500">
        Press Enter or click Add to add bullet points. Maximum {maxPoints} points allowed.
      </div>
    </div>
  )
}
