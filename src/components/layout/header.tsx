'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bell, Search, User } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - could add breadcrumbs here */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">Prompt CRM</h1>
        </div>

        {/* Right side - user info and notifications */}
        <div className="flex items-center space-x-4">
          {/* Global search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search everything..."
              className="w-64 pl-10"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User avatar */}
          <Avatar>
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}