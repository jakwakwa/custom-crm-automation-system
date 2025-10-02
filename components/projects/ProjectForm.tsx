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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: {
    id: string
    title: string
    description?: string | null
    status: string
    companyId?: string
  } | null
  onSuccess?: () => void
}

const projectStatuses = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
]

export function ProjectForm({ open, onOpenChange, project, onSuccess }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    companyId: '',
  })

  const isEditing = !!project

  // Update form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'OPEN',
        companyId: project.companyId || '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'OPEN',
        companyId: '',
      })
    }
  }, [project])

  // Fetch companies for dropdown
  useEffect(() => {
    if (open) {
      fetchCompanies()
    }
  }, [open])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (!response.ok) throw new Error('Failed to fetch companies')
      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast.error('Failed to load companies')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/projects/${project.id}` : '/api/projects'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      toast.success(isEditing ? 'Project updated successfully' : 'Project created successfully')
      onOpenChange(false)
      onSuccess?.()

      // Reset form if creating new
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          status: 'OPEN',
          companyId: '',
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the project information below.'
                : 'Fill in the information to add a new project to your CRM.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Project Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Senior Software Engineer"
                required
              />
            </div>

            {/* Company */}
            <div className="grid gap-2">
              <Label htmlFor="companyId">
                Company <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleChange('companyId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No companies found. Create one first.
                    </div>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Track the current state of this project
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the project or position..."
                rows={4}
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
            <Button type="submit" disabled={loading || !formData.companyId}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
