'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, MessageSquare, MoreVertical, Edit, Trash } from 'lucide-react'

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

interface PersonCardProps {
  person: Person
  onEdit?: (person: Person) => void
  onDelete?: (id: string) => void
  onView?: (person: Person) => void
}

export function PersonCard({ person, onEdit, onDelete, onView }: PersonCardProps) {
  const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()
  const fullName = `${person.firstName} ${person.lastName}`

  // Get relationship types
  const relationshipTypes = Array.from(
    new Set(person.relationships.map((r) => r.type))
  )

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        {/* Header with Avatar and Actions */}
        <div className="mb-4 flex items-start justify-between">
          <Avatar className="size-12 cursor-pointer" onClick={() => onView?.(person)}>
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(person)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(person)}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(person.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Name */}
        <h3
          className="mb-1 cursor-pointer text-lg font-semibold hover:text-primary"
          onClick={() => onView?.(person)}
        >
          {fullName}
        </h3>

        {/* Email */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-3.5" />
          <span className="truncate">{person.email}</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5">
          {person.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="size-3.5" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.whatsapp && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              <span>{person.whatsapp}</span>
            </div>
          )}
        </div>

        {/* Relationship Badges */}
        {relationshipTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
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
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
        Added {new Date(person.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  )
}
