'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  MessageSquare,
  Tags,
  FolderOpen,
  Settings,
  Plus,
  Search,
  Star,
  BarChart3,
  FileDown
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'All Prompts', href: '/prompts', icon: MessageSquare },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'PDF Exports', href: '/exports', icon: FileDown },
  { name: 'Favorites', href: '/favorites', icon: Star },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [promptCount] = useState(0) // Will be populated with real data later

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Prompt CRM</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full rounded-md bg-slate-800 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
              {item.name === 'All Prompts' && promptCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {promptCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Create Button */}
      <div className="p-4">
        <Button
          asChild
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Link href="/prompts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Link>
        </Button>
      </div>

      {/* Settings */}
      <div className="border-t border-slate-700 p-4">
        <Link
          href="/settings"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  )
}