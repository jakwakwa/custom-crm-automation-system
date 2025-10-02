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

type RelationshipType = 'CLIENT' | 'CANDIDATE' | 'BOTH'

interface RelationshipFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  relationship?: {
    id: string
    personId: string
    companyId?: string | null
    projectId?: string | null
    type: RelationshipType
    notes?: string | null
  } | null
  onSuccess?: () => void
}

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Company {
  id: string
  name: string
}

interface Project {
  id: string
  title: string
  company: {
    name: string
  }
}

export function RelationshipForm({
  open,
  onOpenChange,
  relationship,
  onSuccess,
}: RelationshipFormProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [people, setPeople] = useState<Person[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  
  const [formData, setFormData] = useState({
    personId: relationship?.personId || '',
    companyId: relationship?.companyId || '',
    projectId: relationship?.projectId || '',
    type: relationship?.type || ('CLIENT' as RelationshipType),
    notes: relationship?.notes || '',
  })

  const isEditing = !!relationship

  // Fetch people, companies, and projects
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      setLoadingData(true)
      const [peopleRes, companiesRes, projectsRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/companies'),
        fetch('/api/projects'),
      ])

      const [peopleData, companiesData, projectsData] = await Promise.all([
        peopleRes.json(),
        companiesRes.json(),
        projectsRes.json(),
      ])

      setPeople(peopleData.persons || [])
      setCompanies(companiesData.companies || [])
      setProjects(projectsData.projects || [])
    } catch (error) {
      toast.error('Failed to load form data')
      console.error(error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean up empty strings to null
      const payload = {
        ...formData,
        companyId: formData.companyId || null,
        projectId: formData.projectId || null,
      }

      const url = isEditing
        ? `/api/relationships/${relationship.id}`
        : '/api/relationships'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save relationship')
      }

      toast.success(
        isEditing
          ? 'Relationship updated successfully'
          : 'Relationship created successfully'
      )
      onOpenChange(false)
      onSuccess?.()

      // Reset form if creating new
      if (!isEditing) {
        setFormData({
          personId: '',
          companyId: '',
          projectId: '',
          type: 'CLIENT',
          notes: '',
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
            <DialogTitle>
              {isEditing ? 'Edit Relationship' : 'Add New Relationship'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the relationship information below.'
                : 'Create a new relationship between a person, company, and/or project.'}
            </DialogDescription>
          </DialogHeader>

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {/* Person Selection */}
              <div className="grid gap-2">
                <Label htmlFor="personId">
                  Person <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.personId}
                  onValueChange={(value) => handleChange('personId', value)}
                  required
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.firstName} {person.lastName} ({person.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Person cannot be changed after creation
                  </p>
                )}
              </div>

              {/* Relationship Type */}
              <div className="grid gap-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="CANDIDATE">Candidate</SelectItem>
                    <SelectItem value="BOTH">Both (Client & Candidate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company Selection */}
              <div className="grid gap-2">
                <Label htmlFor="companyId">Company (Optional)</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => handleChange('companyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Selection */}
              <div className="grid gap-2">
                <Label htmlFor="projectId">Project (Optional)</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => handleChange('projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title} ({project.company.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional context or notes about this relationship..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Relationship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
