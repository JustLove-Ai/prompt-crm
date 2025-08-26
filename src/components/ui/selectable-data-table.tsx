'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  CheckSquare, 
  Square, 
  Star,
  Calendar,
  Copy
} from 'lucide-react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface SelectableDataTableProps {
  columns: Column[]
  data: any[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onRowClick?: (row: any) => void
  loading?: boolean
  className?: string
}

export function SelectableDataTable({
  columns,
  data,
  selectedIds,
  onSelectionChange,
  onRowClick,
  loading = false,
  className = ""
}: SelectableDataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const isAllSelected = data.length > 0 && selectedIds.size === data.length
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < data.length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(data.map(row => row.id)))
    }
  }

  const toggleSelectRow = (rowId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const newSelection = new Set(selectedIds)
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId)
    } else {
      newSelection.add(rowId)
    }
    onSelectionChange(newSelection)
  }

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return (
      <div className={`rounded-md border ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="animate-pulse h-4 bg-gray-200 rounded" />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-4" />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleSelectAll}
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : isIndeterminate ? (
                  <div className="h-4 w-4 border-2 border-blue-600 bg-blue-600 rounded-sm flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-sm" />
                  </div>
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
            </TableHead>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {sortColumn === column.key && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + 1} 
                className="h-24 text-center text-muted-foreground"
              >
                No results found
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow
                key={row.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedIds.has(row.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => toggleSelectRow(row.id, e)}
                  >
                    {selectedIds.has(row.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}