import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Tags } from 'lucide-react'
import Link from 'next/link'
import { NewTagForm } from './new-tag-form'

export default function NewTagPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Tag</h1>
          <p className="text-muted-foreground">
            Create a new tag to label your prompts
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tags className="h-5 w-5" />
            <span>Tag Details</span>
          </CardTitle>
          <CardDescription>
            Fill in the information below to create a new tag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewTagForm />
        </CardContent>
      </Card>
    </div>
  )
}