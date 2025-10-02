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
  User,
  Building2,
  FolderOpen,
  Loader2,
  Users,
} from 'lucide-react'
import { RelationshipCard } from './RelationshipCard'
import { RelationshipForm } from './RelationshipForm'
import { toast } from 'sonner'

type ViewMode = 'table' | 'grid'
type RelationshipType = 'CLIENT' | 'CANDIDATE' | 'BOTH'

interface Relationship {
  id: string
  type: RelationshipType
  notes: string | null
  createdAt: Date
  person: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  company?: {
    id: string
    name: string
  } | null
  project?: {
    id: string
    title: string
  } | null
}

const typeColors = {
  CLIENT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200',
  CANDIDATE: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200',
  BOTH: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200',
}

export function RelationshipsList() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null)

  // Fetch relationships from API
  const fetchRelationships = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/relationships')
      if (!response.ok) throw new Error('Failed to fetch relationships')
      const data = await response.json()
      setRelationships(data.relationships || [])
    } catch (error) {
      toast.error('Failed to load relationships')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelationships()
  }, [])

  // Filter relationships based on search and type
  const filteredRelationships = relationships.filter((rel) => {
    const personName = `${rel.person.firstName} ${rel.person.lastName}`.toLowerCase()
    const personEmail = rel.person.email.toLowerCase()
    const companyName = rel.company?.name.toLowerCase() || ''
    const projectTitle = rel.project?.title.toLowerCase() || ''

    const matchesSearch =
      personName.includes(searchTerm.toLowerCase()) ||
      personEmail.includes(searchTerm.toLowerCase()) ||
      companyName.includes(searchTerm.toLowerCase()) ||
      projectTitle.includes(searchTerm.toLowerCase())

    if (filterType === 'all') return matchesSearch
    return matchesSearch && rel.type === filterType
  })

  // Handlers
  const handleEdit = (relationship: Relationship) => {
    setSelectedRelationship({
      id: relationship.id,
      personId: relationship.person.id,
      companyId: relationship.company?.id || null,
      projectId: relationship.project?.id || null,
      type: relationship.type,
      notes: relationship.notes,
    })
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return

    try {
      const response = await fetch(`/api/relationships/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete relationship')
      toast.success('Relationship deleted successfully')
      fetchRelationships()
    } catch (error) {
      toast.error('Failed to delete relationship')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedRelationship(null)
  }

  const handleFormSuccess = () => {
    fetchRelationships()
  }

  const handleView = (relationship: Relationship) => {
    // For now, just show edit form - can be expanded to a detail view
    handleEdit(relationship)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relationships</h1>
          <p className="text-muted-foreground">
            Manage connections between people, companies, and projects
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Relationship
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CLIENT">Clients</SelectItem>
              <SelectItem value="CANDIDATE">Candidates</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
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
      ) : filteredRelationships.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Users className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No relationships found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first relationship'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Relationship
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRelationships.map((relationship) => (
                <TableRow key={relationship.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="size-5" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {relationship.person.firstName}{' '}
                          {relationship.person.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {relationship.person.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={typeColors[relationship.type]}
                    >
                      {relationship.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {relationship.company ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {relationship.company.name}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {relationship.project ? (
                      <div className="flex items-center gap-2 text-sm">
                        <FolderOpen className="size-3.5 text-muted-foreground" />
                        {relationship.project.title}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(relationship.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(relationship)}
                        >
                          <Edit className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(relationship.id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRelationships.map((relationship) => (
            <RelationshipCard
              key={relationship.id}
              relationship={relationship}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={() => handleDelete(relationship.id)}
            />
          ))}
        </div>
      )}

      {/* Relationship Form Dialog */}
      <RelationshipForm
        open={formOpen}
        onOpenChange={handleFormClose}
        relationship={selectedRelationship}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
