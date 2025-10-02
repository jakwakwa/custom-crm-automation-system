import { Mail, MessageCircle, MessageSquare, MoreVertical, Pencil, Trash2, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/date'

interface SequenceTemplate {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  steps: SequenceTemplateStep[]
}

interface SequenceTemplateStep {
  id: string
  stepNumber: number
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS'
  template: string
  subject: string | null
  messageTemplateId: string | null
  delayDays: number
  messageTemplate: {
    id: string
    name: string
  } | null
}

interface SequenceCardProps {
  sequence: SequenceTemplate
  onEdit: () => void
  onDelete: () => void
}

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  SMS: MessageSquare,
}

const channelColors = {
  EMAIL: 'bg-blue-100 text-blue-800',
  WHATSAPP: 'bg-green-100 text-green-800',
  SMS: 'bg-purple-100 text-purple-800',
}

export function SequenceCard({ sequence, onEdit, onDelete }: SequenceCardProps) {
  const channelCounts = sequence.steps.reduce((acc, step) => {
    acc[step.channel] = (acc[step.channel] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalDays = sequence.steps.length > 0
    ? Math.max(...sequence.steps.map(s => s.delayDays))
    : 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{sequence.name}</CardTitle>
              <Badge variant={sequence.isActive ? 'default' : 'secondary'}>
                {sequence.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {sequence.description && (
              <CardDescription className="line-clamp-2">
                {sequence.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="mr-1 h-4 w-4" />
              {totalDays} day{totalDays !== 1 ? 's' : ''}
            </div>
            <div className="font-medium">
              {sequence.steps.length} step{sequence.steps.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Channel badges */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(channelCounts).map(([channel, count]) => {
              const Icon = channelIcons[channel as keyof typeof channelIcons]
              return (
                <Badge
                  key={channel}
                  variant="outline"
                  className={channelColors[channel as keyof typeof channelColors]}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {channel} ({count})
                </Badge>
              )
            })}
          </div>

          {/* Steps preview */}
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-gray-500 uppercase">Steps</div>
            {sequence.steps.slice(0, 3).map((step) => {
              const Icon = channelIcons[step.channel]
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium">
                    {step.stepNumber}
                  </div>
                  <Icon className="h-3 w-3" />
                  <span className="text-xs">
                    Day {step.delayDays}
                  </span>
                  {step.messageTemplate && (
                    <span className="text-xs text-gray-400 truncate">
                      - {step.messageTemplate.name}
                    </span>
                  )}
                </div>
              )
            })}
            {sequence.steps.length > 3 && (
              <div className="text-xs text-gray-400 pl-8">
                +{sequence.steps.length - 3} more step{sequence.steps.length - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-400 pt-2 border-t">
            Created {formatDate(sequence.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
