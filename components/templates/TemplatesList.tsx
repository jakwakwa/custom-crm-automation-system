'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Edit,
  Trash,
  Mail,
  MessageSquare,
  Phone,
  Loader2,
  FileText,
} from 'lucide-react'
import { TemplateCard } from './TemplateCard'
import { TemplateForm } from './TemplateForm'
import { toast } from 'sonner'
import { formatDateReadable } from '@/utils/date'

type ViewMode = 'table' | 'grid'
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

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageSquare,
  SMS: Phone,
}

const channelColors = {
  EMAIL: 'text-blue-500',
  WHATSAPP: 'text-green-500',
  SMS: 'text-purple-500',
}

export function TemplatesList() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChannel, setFilterChannel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      toast.error('Failed to load templates')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.body.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesChannel = filterChannel === 'all' || template.channel === filterChannel
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && template.isActive) ||
      (filterStatus === 'inactive' && !template.isActive)

    return matchesSearch && matchesChannel && matchesStatus
  })

  // Handlers
  const handleEdit = (template: Template) => {
    setSelectedTemplate(template)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete template')
      toast.success('Template deleted successfully')
      fetchTemplates()
    } catch {
      toast.error('Failed to delete template')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedTemplate(null)
  }

  const handleFormSuccess = () => {
    fetchTemplates()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable message templates
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Template
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Channel Filter */}
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FileText className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterChannel !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first template'}
          </p>
          {!searchTerm && filterChannel === 'all' && filterStatus === 'all' && (
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Create Template
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => {
                const ChannelIcon = channelIcons[template.channel]
                return (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ChannelIcon className={`size-4 ${channelColors[template.channel]}`} />
                        <span className="text-sm">{template.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.category ? (
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={template.isActive ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateReadable(template.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(template.id)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Template Form Dialog */}
      <TemplateForm
        open={formOpen}
        onOpenChange={handleFormClose}
        template={selectedTemplate}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
