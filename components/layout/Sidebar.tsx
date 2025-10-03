'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Building2,
  Briefcase,
  Workflow,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCrmStore } from '@/stores/crmStore'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
    description: 'Overview and analytics',
  },
  {
    name: 'People',
    href: '/people',
    icon: Users,
    description: 'Manage contacts',
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: Building2,
    description: 'Organization management',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Briefcase,
    description: 'Opportunities & positions',
  },
  {
    name: 'Sequences',
    href: '/sequences',
    icon: Workflow,
    description: 'Automated outreach',
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: MessageSquare,
    description: 'Message templates',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App configuration',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useCrmStore()

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-4">
        {isSidebarOpen ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Workflow className="size-5" />
            </div>
            <span className="font-bold">CRM Automation</span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center justify-center">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Workflow className="size-5" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                  !isSidebarOpen && 'justify-center'
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon className={cn('size-5 flex-shrink-0', isActive && 'text-primary')} />
                {isSidebarOpen && (
                  <div className="flex flex-col">
                    <span className="leading-none">{item.name}</span>
                    {isActive && (
                      <span className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size={isSidebarOpen ? 'default' : 'icon'}
          onClick={toggleSidebar}
          className="w-full"
        >
          {isSidebarOpen ? (
            <>
              <ChevronLeft className="mr-2 size-4" />
              Collapse
            </>
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
