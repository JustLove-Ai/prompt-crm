import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Tags } from 'lucide-react'
import Link from 'next/link'
import { getTagById } from '@/lib/actions/tags'
import { EditTagForm } from './edit-tag-form'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTagPage({ params }: PageProps) {
  const { id } = await params
  const result = await getTagById(id)

  if (!result.success) {
    redirect('/tags')
  }

  const tag = result.data!

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Tag</h1>
          <p className="text-muted-foreground">
            Update the tag details
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
            Modify the information below to update the tag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditTagForm tag={tag} />
        </CardContent>
      </Card>
    </div>
  )
}