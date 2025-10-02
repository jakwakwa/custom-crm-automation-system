'use client'

import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SequenceTemplate {
  id: string
  name: string
  description: string | null
  isActive: boolean
  steps: Array<{
    stepNumber: number
    channel: string
    delayDays: number
  }>
}

interface StartSequenceDialogProps {
  personId: string
  personName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StartSequenceDialog({
  personId,
  personName,
  open,
  onOpenChange,
  onSuccess,
}: StartSequenceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<SequenceTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/sequences')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      // Only show active templates with steps
      const activeTemplates = data.sequences.filter(
        (t: SequenceTemplate) => t.isActive && t.steps.length > 0
      )
      setTemplates(activeTemplates)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load sequence templates')
    }
  }

  const handleStart = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a sequence template')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/persons/${personId}/sequences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceTemplateId: selectedTemplate }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start sequence')
      }

      toast.success('Sequence started successfully!')
      onSuccess()
      onOpenChange(false)
      setSelectedTemplate('')
    } catch (error) {
      console.error('Error starting sequence:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start sequence')
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Outreach Sequence</DialogTitle>
          <DialogDescription>
            Start an automated outreach sequence for {personName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="template">Select Sequence Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Choose a sequence..." />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No active templates available
                  </div>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.steps.length} steps)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div>
                <h4 className="font-semibold text-sm">
                  {selectedTemplateData.name}
                </h4>
                {selectedTemplateData.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTemplateData.description}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Steps Preview
                </p>
                <div className="space-y-2">
                  {selectedTemplateData.steps.slice(0, 3).map((step) => (
                    <div
                      key={step.stepNumber}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-medium">
                        {step.stepNumber}
                      </div>
                      <Badge variant="outline">{step.channel}</Badge>
                      <span className="text-xs text-gray-500">
                        Day {step.delayDays}
                      </span>
                    </div>
                  ))}
                  {selectedTemplateData.steps.length > 3 && (
                    <div className="text-xs text-gray-400 pl-8">
                      +{selectedTemplateData.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleStart}
            disabled={loading || !selectedTemplate}
          >
            <Play className="mr-2 h-4 w-4" />
            {loading ? 'Starting...' : 'Start Sequence'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
