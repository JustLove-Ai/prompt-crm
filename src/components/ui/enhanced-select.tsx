'use client'

import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandInput } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Label } from './label'

interface Option {
  value: string
  label: string
  color?: string
}

interface EnhancedSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  onCreateNew?: (name: string, color?: string) => Promise<Option>
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  createNewLabel?: string
  createNewTitle?: string
  createNewDescription?: string
  allowColorSelection?: boolean
  noneOption?: boolean
  noneLabel?: string
}

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

export function EnhancedSelect({
  options,
  value,
  onValueChange,
  onCreateNew,
  placeholder = "Select item...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  className,
  createNewLabel = "Create new",
  createNewTitle = "Create New Item",
  createNewDescription = "Enter the details for the new item.",
  allowColorSelection = true,
  noneOption = true,
  noneLabel = "None"
}: EnhancedSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemColor, setNewItemColor] = useState(DEFAULT_COLORS[0])
  const [creating, setCreating] = useState(false)

  const selectedOption = options.find(option => option.value === value)

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setOpen(false)
  }

  const handleCreateNew = async () => {
    if (!newItemName.trim() || !onCreateNew) return

    setCreating(true)
    try {
      const newOption = await onCreateNew(
        newItemName.trim(),
        allowColorSelection ? newItemColor : undefined
      )
      
      // Select the new option
      onValueChange(newOption.value)
      
      // Reset form
      setNewItemName('')
      setNewItemColor(DEFAULT_COLORS[0])
      setShowCreateDialog(false)
      setSearchValue('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create new item:', error)
      alert('Failed to create new item')
    } finally {
      setCreating(false)
    }
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )


  return (
    <>
      <div className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedOption ? (
                <div className="flex items-center space-x-2">
                  {selectedOption.color && (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedOption.color }}
                    />
                  )}
                  <span>{selectedOption.label}</span>
                </div>
              ) : value === 'none' ? (
                <span className="text-muted-foreground">{noneLabel}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>
                <div className="py-2">
                  <p className="text-sm text-muted-foreground">{emptyText}</p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {noneOption && (
                  <CommandItem
                    value="none"
                    onSelect={() => handleSelect('none')}
                    className="flex items-center justify-between"
                  >
                    <span className="text-muted-foreground">{noneLabel}</span>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === 'none' ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )}
                {onCreateNew && (
                  <CommandItem
                    value="create-new"
                    onSelect={() => {
                      setNewItemName('')
                      setShowCreateDialog(true)
                      setOpen(false)
                    }}
                    className="border-b"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createNewLabel}
                  </CommandItem>
                )}
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      {option.color && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span>{option.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Create New Item Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createNewTitle}</DialogTitle>
            <DialogDescription>{createNewDescription}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter name..."
              />
            </div>
            
            {allowColorSelection && (
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        newItemColor === color ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewItemColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNew}
              disabled={!newItemName.trim() || creating}
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}