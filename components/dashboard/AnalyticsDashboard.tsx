'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Briefcase, Mail, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data - replace with real data from API
const messageData = [
  { name: 'Mon', email: 45, whatsapp: 32, sms: 18 },
  { name: 'Tue', email: 52, whatsapp: 41, sms: 22 },
  { name: 'Wed', email: 48, whatsapp: 38, sms: 20 },
  { name: 'Thu', email: 61, whatsapp: 45, sms: 25 },
  { name: 'Fri', email: 55, whatsapp: 42, sms: 23 },
  { name: 'Sat', email: 38, whatsapp: 28, sms: 15 },
  { name: 'Sun', email: 42, whatsapp: 31, sms: 17 },
]

const sequenceData = [
  { name: 'Active', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Paused', value: 12, color: 'hsl(var(--chart-2))' },
  { name: 'Completed', value: 89, color: 'hsl(var(--chart-3))' },
  { name: 'Cancelled', value: 8, color: 'hsl(var(--chart-4))' },
]

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  description: string
}

function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="size-3 text-green-500" />
          ) : (
            <TrendingDown className="size-3 text-red-500" />
          )}
          <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change)}%
          </span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your CRM automation performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total People"
          value="2,847"
          change={12.5}
          icon={<Users className="size-4" />}
          description="from last month"
        />
        <MetricCard
          title="Companies"
          value="584"
          change={8.2}
          icon={<Building2 className="size-4" />}
          description="from last month"
        />
        <MetricCard
          title="Active Projects"
          value="127"
          change={-3.1}
          icon={<Briefcase className="size-4" />}
          description="from last month"
        />
        <MetricCard
          title="Messages Sent"
          value="18,492"
          change={23.7}
          icon={<Mail className="size-4" />}
          description="from last week"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Message Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>
              Messages sent by channel over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="email" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="whatsapp" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sms" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sequence Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sequence Status</CardTitle>
            <CardDescription>
              Distribution of outreach sequences by status
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sequenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: { name?: string; percent?: number }) => `${props.name || ''} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sequenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your CRM system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'New person added',
                details: 'John Doe (john@example.com)',
                time: '2 minutes ago',
              },
              {
                action: 'Sequence completed',
                details: 'Welcome Series for Jane Smith',
                time: '15 minutes ago',
              },
              {
                action: 'Message sent',
                details: 'WhatsApp message to Mike Johnson',
                time: '1 hour ago',
              },
              {
                action: 'Project created',
                details: 'Senior Developer position at TechCorp',
                time: '3 hours ago',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
