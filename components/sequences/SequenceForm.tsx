'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Mail, MessageCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SequenceTemplate {
  id: string
  name: string
  description: string | null
  isActive: boolean
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

interface StepFormData {
  tempId: string
  stepNumber: number
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | ''
  template: string
  subject: string
  messageTemplateId: string
  delayDays: number
}

interface MessageTemplate {
  id: string
  name: string
  channel: string
  subject: string | null
  body: string
}

interface SequenceFormProps {
  sequence: SequenceTemplate | null
  onSuccess: () => void
  onCancel: () => void
}

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  SMS: MessageSquare,
}

export function SequenceForm({ sequence, onSuccess, onCancel }: SequenceFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(sequence?.name || '')
  const [description, setDescription] = useState(sequence?.description || '')
  const [isActive, setIsActive] = useState(sequence?.isActive ?? true)
  const [steps, setSteps] = useState<StepFormData[]>([])
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([])

  useEffect(() => {
    // Fetch message templates
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => setMessageTemplates(data.templates))
      .catch(err => console.error('Failed to fetch templates:', err))

    // Initialize steps
    if (sequence?.steps) {
      setSteps(
        sequence.steps.map((step) => ({
          tempId: step.id,
          stepNumber: step.stepNumber,
          channel: step.channel,
          template: step.template,
          subject: step.subject || '',
          messageTemplateId: step.messageTemplateId || '',
          delayDays: step.delayDays,
        }))
      )
    } else {
      // Start with one empty step
      const newStep: StepFormData = {
        tempId: `temp-${Date.now()}`,
        stepNumber: 1,
        channel: '',
        template: '',
        subject: '',
        messageTemplateId: '',
        delayDays: 0,
      }
      setSteps([newStep])
    }
  }, [sequence])

  const addStep = () => {
    const newStep: StepFormData = {
      tempId: `temp-${Date.now()}`,
      stepNumber: steps.length + 1,
      channel: '',
      template: '',
      subject: '',
      messageTemplateId: '',
      delayDays: steps.length === 0 ? 0 : 1,
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (tempId: string) => {
    const newSteps = steps
      .filter(s => s.tempId !== tempId)
      .map((s, index) => ({ ...s, stepNumber: index + 1 }))
    setSteps(newSteps)
  }

  const updateStep = (tempId: string, updates: Partial<StepFormData>) => {
    setSteps(steps.map(s => s.tempId === tempId ? { ...s, ...updates } : s))
  }

  const handleTemplateSelect = (tempId: string, templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId)
    if (template) {
      updateStep(tempId, {
        messageTemplateId: templateId,
        channel: template.channel as 'EMAIL' | 'WHATSAPP' | 'SMS',
        template: template.body,
        subject: template.subject || '',
      })
    }
  }

  const insertVariable = (tempId: string, variable: string) => {
    const step = steps.find(s => s.tempId === tempId)
    if (step) {
      updateStep(tempId, {
        template: step.template + `{{${variable}}}`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error('Please enter a sequence name')
      return
    }

    if (steps.length === 0) {
      toast.error('Please add at least one step')
      return
    }

    for (const step of steps) {
      if (!step.channel) {
        toast.error(`Step ${step.stepNumber}: Please select a channel`)
        return
      }
      if (!step.template.trim()) {
        toast.error(`Step ${step.stepNumber}: Please enter message content`)
        return
      }
      if (step.channel === 'EMAIL' && !step.subject.trim()) {
        toast.error(`Step ${step.stepNumber}: Email requires a subject`)
        return
      }
    }

    setLoading(true)

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        isActive,
        steps: steps.map(step => ({
          stepNumber: step.stepNumber,
          channel: step.channel,
          template: step.template,
          subject: step.channel === 'EMAIL' ? step.subject : null,
          messageTemplateId: step.messageTemplateId || null,
          delayDays: step.delayDays,
        })),
      }

      const url = sequence ? `/api/sequences/${sequence.id}` : '/api/sequences'
      const method = sequence ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save sequence')
      }

      toast.success(sequence ? 'Sequence updated successfully' : 'Sequence created successfully')
      onSuccess()
    } catch (error) {
      console.error('Error saving sequence:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save sequence')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sequence ? 'Edit Sequence' : 'Create New Sequence'}
          </DialogTitle>
          <DialogDescription>
            Build a multi-channel outreach sequence with timed steps
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sequence Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Sequence Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 4-Day Candidate Outreach"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this sequence..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Steps</h3>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No steps yet. Click &quot;Add Step&quot; to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step) => {
                  const Icon = step.channel && channelIcons[step.channel]
                  return (
                    <div
                      key={step.tempId}
                      className="border rounded-lg p-4 space-y-4 bg-gray-50"
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-semibold">
                            {step.stepNumber}
                          </div>
                          {Icon && <Icon className="h-5 w-5 text-gray-600" />}
                          <span className="font-medium">Step {step.stepNumber}</span>
                        </div>
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(step.tempId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>

                      {/* Step Config */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Channel *</Label>
                          <Select
                            value={step.channel}
                            onValueChange={(value) =>
                              updateStep(step.tempId, { channel: value as 'EMAIL' | 'WHATSAPP' | 'SMS' | '' })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL">📧 Email</SelectItem>
                              <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                              <SelectItem value="SMS">📱 SMS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Delay (days) *</Label>
                          <Input
                            type="number"
                            min={0}
                            value={step.delayDays}
                            onChange={(e) =>
                              updateStep(step.tempId, { delayDays: parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>

                      {/* Use Template */}
                      <div>
                        <Label>Use Message Template (Optional)</Label>
                        <Select
                          value={step.messageTemplateId || "__none__"}
                          onValueChange={(value) => handleTemplateSelect(step.tempId, value === "__none__" ? "" : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template or write custom message" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">-- None (Custom Message) --</SelectItem>
                            {messageTemplates
                              .filter((t) => !step.channel || t.channel === step.channel)
                              .map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subject (Email only) */}
                      {step.channel === 'EMAIL' && (
                        <div>
                          <Label>Subject *</Label>
                          <Input
                            value={step.subject}
                            onChange={(e) =>
                              updateStep(step.tempId, { subject: e.target.value })
                            }
                            placeholder="Email subject line"
                          />
                        </div>
                      )}

                      {/* Message Body */}
                      <div>
                        <Label>Message *</Label>
                        <Textarea
                          value={step.template}
                          onChange={(e) =>
                            updateStep(step.tempId, { template: e.target.value })
                          }
                          placeholder="Write your message..."
                          rows={4}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(step.tempId, 'firstName')}
                          >
                            + firstName
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(step.tempId, 'lastName')}
                          >
                            + lastName
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(step.tempId, 'companyName')}
                          >
                            + companyName
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : sequence ? 'Update Sequence' : 'Create Sequence'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
