'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X, Star } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
  color: string
}

interface FiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedTags: string[]
  onTagsChange: (value: string[]) => void
  showFavoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  categories: Category[]
  tags: Tag[]
  promptTypes: string[]
  onClearFilters: () => void
  activeFiltersCount: number
}

export function Filters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  categories,
  tags,
  promptTypes,
  onClearFilters,
  activeFiltersCount
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color
  }))

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prompts by title, content, or instructions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters & Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={onToggleFavoritesOnly}
          >
            <Star className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites Only
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters ({activeFiltersCount})
            </Button>
          )}
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type-filter">Type</Label>
                  <Select value={selectedType} onValueChange={onTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {promptTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <MultiSelect
                    options={tagOptions}
                    selected={selectedTags}
                    onChange={onTagsChange}
                    placeholder="Filter by tags..."
                    searchPlaceholder="Search tags..."
                    emptyText="No tags found."
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => setIsOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onClearFilters()
                      setIsOpen(false)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {selectedType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onTypeChange('all')}
              />
            </Badge>
          )}
          
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory === 'uncategorized' ? 'Uncategorized' : 
                categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryChange('all')}
              />
            </Badge>
          )}
          
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId)
            if (!tag) return null
            return (
              <Badge 
                key={tagId}
                style={{ 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color, 
                  borderColor: tag.color 
                }}
                className="flex items-center gap-1"
              >
                {tag.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onTagsChange(selectedTags.filter(id => id !== tagId))}
                />
              </Badge>
            )
          })}
          
          {showFavoritesOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Favorites Only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={onToggleFavoritesOnly}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}