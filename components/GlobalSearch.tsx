'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  User,
  Building2,
  Briefcase,
  Link2,
  Loader2,
  X,
  Command,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchResult {
  people: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }>
  companies: Array<{
    id: string
    name: string
    industry: string | null
  }>
  projects: Array<{
    id: string
    title: string
    status: string
    company: {
      id: string
      name: string
    } | null
  }>
  relationships: Array<{
    id: string
    type: string
    notes: string | null
    person: {
      id: string
      firstName: string
      lastName: string
    } | null
    company: {
      id: string
      name: string
    } | null
    project: {
      id: string
      title: string
    } | null
  }>
  total: number
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
    }
  }, [open])

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setResults(data)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Flatten results for keyboard navigation
  const flatResults = results
    ? [
        ...results.people.map((p) => ({ type: 'person' as const, data: p })),
        ...results.companies.map((c) => ({ type: 'company' as const, data: c })),
        ...results.projects.map((p) => ({ type: 'project' as const, data: p })),
        ...results.relationships.map((r) => ({ type: 'relationship' as const, data: r })),
      ]
    : []

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % flatResults.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length)
      } else if (e.key === 'Enter' && flatResults.length > 0) {
        e.preventDefault()
        handleSelect(flatResults[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flatResults, selectedIndex])

  const handleSelect = (result: { type: string; data: Record<string, unknown> }) => {
    setOpen(false)
    
    switch (result.type) {
      case 'person':
        router.push(`/people/${result.data.id as string}`)
        break
      case 'company':
        router.push(`/companies/${result.data.id as string}`)
        break
      case 'project':
        router.push(`/projects/${result.data.id as string}`)
        break
      case 'relationship': {
        const person = result.data.person as { id: string } | null | undefined
        if (person?.id) {
          router.push(`/people/${person.id}`)
        }
        break
      }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'person':
        return <User className="h-4 w-4 text-blue-600" />
      case 'company':
        return <Building2 className="h-4 w-4 text-green-600" />
      case 'project':
        return <Briefcase className="h-4 w-4 text-purple-600" />
      case 'relationship':
        return <Link2 className="h-4 w-4 text-orange-600" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'person':
        return 'Person'
      case 'company':
        return 'Company'
      case 'project':
        return 'Project'
      case 'relationship':
        return 'Relationship'
      default:
        return type
    }
  }

  const renderResult = (result: { type: string; data: Record<string, unknown> }, index: number) => {
    const isSelected = index === selectedIndex
    const data = result.data as {
      id?: string
      firstName?: string
      lastName?: string
      email?: string
      name?: string
      industry?: string
      title?: string
      status?: string
      type?: string
      company?: { id: string; name: string }
      person?: { id: string; firstName: string; lastName: string }
      project?: { id: string; title: string }
    }

    return (
      <button
        key={`${result.type}-${data.id}`}
        onClick={() => handleSelect(result)}
        className={cn(
          'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
          isSelected ? 'bg-accent' : 'hover:bg-accent/50'
        )}
      >
        <div className="mt-0.5">{getIcon(result.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">
              {result.type === 'person' &&
                `${data.firstName} ${data.lastName}`}
              {result.type === 'company' && data.name}
              {result.type === 'project' && data.title}
              {result.type === 'relationship' &&
                data.person &&
                `${data.person.firstName} ${data.person.lastName}`}
            </span>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(result.type)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {result.type === 'person' && data.email}
            {result.type === 'company' && data.industry}
            {result.type === 'project' && (
              <>
                {data.status}
                {data.company && ` • ${data.company.name}`}
              </>
            )}
            {result.type === 'relationship' && (
              <>
                {data.type}
                {data.company && ` at ${data.company.name}`}
                {data.project && ` • ${data.project.title}`}
              </>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent transition-colors w-full max-w-sm"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          
          {/* Search input */}
          <div className="flex items-center border-b px-4 py-3">
            {loading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
            <Input
              placeholder="Search people, companies, projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-3"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[500px] overflow-y-auto">
            {!query && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start typing to search across all records</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">People</Badge>
                  <Badge variant="outline">Companies</Badge>
                  <Badge variant="outline">Projects</Badge>
                  <Badge variant="outline">Relationships</Badge>
                </div>
              </div>
            )}

            {query && results && results.total === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for &quot;{query}&quot;</p>
              </div>
            )}

            {results && results.total > 0 && (
              <div className="py-2">
                {/* People */}
                {results.people.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      People ({results.people.length})
                    </div>
                    {flatResults
                      .filter((r) => r.type === 'person')
                      .map((result) =>
                        renderResult(
                          result,
                          flatResults.findIndex((r) => r === result)
                        )
                      )}
                  </div>
                )}

                {/* Companies */}
                {results.companies.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      Companies ({results.companies.length})
                    </div>
                    {flatResults
                      .filter((r) => r.type === 'company')
                      .map((result) =>
                        renderResult(
                          result,
                          flatResults.findIndex((r) => r === result)
                        )
                      )}
                  </div>
                )}

                {/* Projects */}
                {results.projects.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      Projects ({results.projects.length})
                    </div>
                    {flatResults
                      .filter((r) => r.type === 'project')
                      .map((result) =>
                        renderResult(
                          result,
                          flatResults.findIndex((r) => r === result)
                        )
                      )}
                  </div>
                )}

                {/* Relationships */}
                {results.relationships.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      Relationships ({results.relationships.length})
                    </div>
                    {flatResults
                      .filter((r) => r.type === 'relationship')
                      .map((result) =>
                        renderResult(
                          result,
                          flatResults.findIndex((r) => r === result)
                        )
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {results && results.total > 0 && (
            <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>Use ↑↓ to navigate</span>
              <span>Press Enter to select</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
