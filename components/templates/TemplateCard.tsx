'use client'

import { Mail, MessageSquare, Phone, Edit, Trash, FileText, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateReadable } from '@/utils/date'

type MessageChannel = 'EMAIL' | 'WHATSAPP' | 'SMS'

interface Template {
  id: string
  name: string
  description?: string | null
  channel: MessageChannel
  subject?: string | null
  body: string
  category?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface TemplateCardProps {
  template: Template
  onEdit: (template: Template) => void
  onDelete: (id: string) => void
}

const channelConfig = {
  EMAIL: { icon: Mail, label: 'Email', color: 'text-blue-500' },
  WHATSAPP: { icon: MessageSquare, label: 'WhatsApp', color: 'text-green-500' },
  SMS: { icon: Phone, label: 'SMS', color: 'text-purple-500' },
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const channelInfo = channelConfig[template.channel]
  const ChannelIcon = channelInfo.icon

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 bg-muted rounded-lg ${channelInfo.color}`}>
              <ChannelIcon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{template.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {channelInfo.label}
                </Badge>
                {!template.isActive && (
                  <Badge variant="outline" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}

        {template.channel === 'EMAIL' && template.subject && (
          <div className="text-sm">
            <span className="text-muted-foreground">Subject: </span>
            <span className="font-medium truncate block">{template.subject}</span>
          </div>
        )}

        <div className="text-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="size-3" />
            <span>Message:</span>
          </div>
          <p className="line-clamp-3 text-xs bg-muted/30 p-2 rounded">
            {template.body}
          </p>
        </div>

        {template.category && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="size-3" />
            <span>{template.category}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2 flex-col items-stretch">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(template)}
          >
            <Edit className="size-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash className="size-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Updated {formatDateReadable(template.updatedAt)}
        </div>
      </CardFooter>
    </Card>
  )
}
