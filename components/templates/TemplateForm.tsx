'use client'

import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { getAvailableVariables } from '@/lib/templateParser'

type MessageChannel = 'EMAIL' | 'WHATSAPP' | 'SMS'

interface TemplateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: {
    id: string
    name: string
    description?: string | null
    channel: MessageChannel
    subject?: string | null
    body: string
    category?: string | null
    isActive: boolean
  } | null
  onSuccess?: () => void
}

export function TemplateForm({ open, onOpenChange, template, onSuccess }: TemplateFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'EMAIL' as MessageChannel,
    subject: '',
    body: '',
    category: '',
    isActive: true,
  })

  const isEditing = !!template
  const availableVariables = getAvailableVariables()

  // Update form data when template prop changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        channel: template.channel || 'EMAIL',
        subject: template.subject || '',
        body: template.body || '',
        category: template.category || '',
        isActive: template.isActive,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        channel: 'EMAIL',
        subject: '',
        body: '',
        category: '',
        isActive: true,
      })
    }
  }, [template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/templates/${template.id}` : '/api/templates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save template')
      }

      toast.success(isEditing ? 'Template updated successfully' : 'Template created successfully')
      onOpenChange(false)
      onSuccess?.()

      // Reset form if creating new
      if (!isEditing) {
        setFormData({
          name: '',
          description: '',
          channel: 'EMAIL',
          subject: '',
          body: '',
          category: '',
          isActive: true,
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.body
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + `{{${variable}}}` + after
      setFormData((prev) => ({ ...prev, body: newText }))
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4)
      }, 0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the message template below.'
                : 'Create a reusable message template with variables.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Template Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Welcome Email, Follow-up WhatsApp"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of when to use this template"
              />
            </div>

            {/* Channel and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="channel">
                  Channel <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) => handleChange('channel', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g., Outreach, Follow-up"
                />
              </div>
            </div>

            {/* Subject (Email only) */}
            {formData.channel === 'EMAIL' && (
              <div className="grid gap-2">
                <Label htmlFor="subject">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Email subject line"
                  required
                />
              </div>
            )}

            {/* Message Body */}
            <div className="grid gap-2">
              <Label htmlFor="body">
                Message Body <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder="Your message here... Use {{variableName}} for dynamic content"
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use double curly braces to insert variables, e.g., {`{{firstName}}`}
              </p>
            </div>

            {/* Available Variables */}
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Available Variables</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((v) => (
                  <Button
                    key={v.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(v.name)}
                    className="text-xs"
                    title={v.description}
                  >
                    {`{{${v.name}}}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Template</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive templates won&apos;t appear in selection lists
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
