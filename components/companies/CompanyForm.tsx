'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: {
    id: string
    name: string
    industry?: string | null
    website?: string | null
    description?: string | null
  } | null
  onSuccess?: () => void
}

export function CompanyForm({ open, onOpenChange, company, onSuccess }: CompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
  })

  const isEditing = !!company

  // Update form data when company prop changes
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        description: company.description || '',
      })
    } else {
      setFormData({
        name: '',
        industry: '',
        website: '',
        description: '',
      })
    }
  }, [company])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/companies/${company.id}` : '/api/companies'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save company')
      }

      toast.success(isEditing ? 'Company updated successfully' : 'Company created successfully')
      onOpenChange(false)
      onSuccess?.()

      // Reset form if creating new
      if (!isEditing) {
        setFormData({
          name: '',
          industry: '',
          website: '',
          description: '',
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
            <DialogTitle>{isEditing ? 'Edit Company' : 'Add New Company'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the company information below.'
                : 'Fill in the information to add a new company to your CRM.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Company Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Acme Corporation"
                required
              />
            </div>

            {/* Industry */}
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="Technology, Healthcare, Finance..."
              />
            </div>

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground">
                Include https:// for the full URL
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the company..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Optional notes about the company
              </p>
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
              {isEditing ? 'Save Changes' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
