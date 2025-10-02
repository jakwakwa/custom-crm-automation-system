'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, X, Clock, Mail, MessageCircle, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateReadable } from '@/utils/date'
import { toast } from 'sonner'

interface ActiveSequence {
  id: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  currentStep: number
  totalSteps: number
  nextStepAt: string | null
  startedAt: string
  completedAt: string | null
  sequenceTemplate: {
    id: string
    name: string
    description: string | null
  } | null
  steps: Array<{
    id: string
    stepNumber: number
    channel: string
    executed: boolean
    executedAt: string | null
  }>
}

interface ActiveSequencesProps {
  personId: string
  onUpdate?: () => void
}

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  SMS: MessageSquare,
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export function ActiveSequences({ personId, onUpdate }: ActiveSequencesProps) {
  const [sequences, setSequences] = useState<ActiveSequence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSequences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId])

  const fetchSequences = async () => {
    try {
      const response = await fetch(`/api/persons/${personId}/sequences`)
      if (!response.ok) throw new Error('Failed to fetch sequences')
      const data = await response.json()
      setSequences(data.sequences)
    } catch (error) {
      console.error('Error fetching sequences:', error)
      toast.error('Failed to load active sequences')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (sequenceId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      const response = await fetch(`/api/outreach-sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${action} sequence`)
      }

      toast.success(`Sequence ${action}d successfully`)
      fetchSequences()
      onUpdate?.()
    } catch (error) {
      console.error(`Error ${action}ing sequence:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} sequence`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sequences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Loading sequences...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sequences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sequences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No active sequences. Click &quot;Start Sequence&quot; to begin.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sequences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sequences.map((sequence) => {
          const completedSteps = sequence.steps.filter((s) => s.executed).length
          const progress = (completedSteps / sequence.totalSteps) * 100

          return (
            <div
              key={sequence.id}
              className="border rounded-lg p-4 space-y-3 bg-gray-50"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {sequence.sequenceTemplate?.name || 'Unnamed Sequence'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={statusColors[sequence.status]}
                    >
                      {sequence.status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Step {completedSteps} of {sequence.totalSteps}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {sequence.status === 'ACTIVE' && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(sequence.id, 'pause')}
                        title="Pause"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(sequence.id, 'cancel')}
                        title="Cancel"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  {sequence.status === 'PAUSED' && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(sequence.id, 'resume')}
                        title="Resume"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(sequence.id, 'cancel')}
                        title="Cancel"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Next Step Info */}
              {sequence.status === 'ACTIVE' && sequence.nextStepAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Next step: {formatDateReadable(sequence.nextStepAt)}
                  </span>
                </div>
              )}

              {/* Steps Preview */}
              <div className="space-y-1">
                {sequence.steps.slice(0, 4).map((step) => {
                  const Icon = channelIcons[step.channel as keyof typeof channelIcons]
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 text-sm ${
                        step.executed ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                          step.executed ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                        }`}
                      >
                        {step.executed ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          step.stepNumber
                        )}
                      </div>
                      {Icon && <Icon className="h-3 w-3" />}
                      <span className="text-xs">Step {step.stepNumber}</span>
                      {step.executed && step.executedAt && (
                        <span className="text-xs text-gray-400">
                          - {formatDateReadable(step.executedAt)}
                        </span>
                      )}
                    </div>
                  )
                })}
                {sequence.steps.length > 4 && (
                  <div className="text-xs text-gray-400 pl-7">
                    +{sequence.steps.length - 4} more steps
                  </div>
                )}
              </div>

              {/* Started Date */}
              <div className="text-xs text-gray-400 pt-2 border-t">
                Started {formatDateReadable(sequence.startedAt)}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
