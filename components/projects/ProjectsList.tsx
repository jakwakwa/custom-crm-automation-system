'use client'

import {
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Grid3x3,
  List,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDateReadable } from '@/utils/date'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ProjectCard } from './ProjectCard'
import { ProjectForm } from './ProjectForm'

type ViewMode = 'table' | 'grid'

interface Project {
  id: string
  title: string
  description?: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ON_HOLD'
  companyId?: string
  createdAt: Date
  closedAt?: Date | null
  company: {
    id: string
    name: string
    industry?: string | null
  }
  _count?: {
    relationships: number
  }
}

const statusConfig = {
  OPEN: { label: 'Open', variant: 'default' as const },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary' as const },
  CLOSED: { label: 'Closed', variant: 'outline' as const },
  ON_HOLD: { label: 'On Hold', variant: 'outline' as const },
}

export function ProjectsList() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      toast.error('Failed to load projects')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === 'all') return matchesSearch

    return matchesSearch && project.status === filterStatus
  })

  // Handlers
  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete project')
      toast.success('Project deleted successfully')
      fetchProjects()
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedProject(null)
  }

  const handleFormSuccess = () => {
    fetchProjects()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage opportunities and track candidates
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Project
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
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
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Briefcase className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first project'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Project
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const relationshipCount = project._count?.relationships ?? 0
                const statusInfo = statusConfig[project.status]

                return (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-accent/50" onClick={() => window.location.href = `/projects/${project.id}`}>
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Briefcase className="size-5" />
                        </div>
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {project.company.name}
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {project.company.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="size-3.5 text-muted-foreground" />
                        {relationshipCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {formatDateReadable(project.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(project)}>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project.id)}
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
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        open={formOpen}
        onOpenChange={handleFormClose}
        project={selectedProject}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
