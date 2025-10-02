'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { PersonCard } from './PersonCard'
import { PersonForm } from './PersonForm'
import { toast } from 'sonner'

type ViewMode = 'table' | 'grid'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  whatsapp?: string | null
  createdAt: Date
  relationships: Array<{ type: string }>
}

export function PeopleList() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  // Fetch people from API
  const fetchPeople = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/persons')
      if (!response.ok) throw new Error('Failed to fetch people')
      const data = await response.json()
      setPeople(data.persons || [])
    } catch (error) {
      toast.error('Failed to load people')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople()
  }, [])

  // Filter people based on search and filter
  const filteredPeople = people.filter((person) => {
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterType === 'all') return matchesSearch

    const hasType = person.relationships.some((r) => r.type === filterType)
    return matchesSearch && hasType
  })

  // Handlers
  const handleEdit = (person: Person) => {
    setSelectedPerson(person)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return

    try {
      const response = await fetch(`/api/persons/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete person')
      toast.success('Person deleted successfully')
      fetchPeople()
    } catch {
      toast.error('Failed to delete person')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedPerson(null)
  }

  const handleFormSuccess = () => {
    fetchPeople()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground">
            Manage your contacts and relationships
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Person
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
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
      ) : filteredPeople.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-lg font-medium">No people found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first person'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Person
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => {
                const relationshipTypes = Array.from(
                  new Set(person.relationships.map((r) => r.type))
                )

                return (
                  <TableRow key={person.id} className="cursor-pointer hover:bg-accent/50" onClick={() => window.location.href = `/people/${person.id}`}>
                    <TableCell>
                      <Link href={`/people/${person.id}`} className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(person.firstName, person.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {person.firstName} {person.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Added {new Date(person.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="size-3.5 text-muted-foreground" />
                        {person.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {person.phone ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="size-3.5 text-muted-foreground" />
                          {person.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {person.whatsapp ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="size-3.5 text-muted-foreground" />
                          {person.whatsapp}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {relationshipTypes.map((type) => (
                          <Badge
                            key={type}
                            variant={
                              type === 'CLIENT'
                                ? 'default'
                                : type === 'CANDIDATE'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {type.toLowerCase()}
                          </Badge>
                        ))}
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
                          <DropdownMenuItem onClick={() => handleEdit(person)}>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(person.id)}
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
          {filteredPeople.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Person Form Dialog */}
      <PersonForm
        open={formOpen}
        onOpenChange={handleFormClose}
        person={selectedPerson}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
