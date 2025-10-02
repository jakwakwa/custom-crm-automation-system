'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SequencesList } from '@/components/sequences/SequencesList'
import { SequenceForm } from '@/components/sequences/SequenceForm'
import { toast } from 'sonner'

interface SequenceTemplate {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  steps: SequenceTemplateStep[]
}

interface SequenceTemplateStep {
  id: string
  stepNumber: number
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS'
  template: string
  subject: string | null
  messageTemplateId: string | null
  delayDays: number
  messageTemplate: {
    id: string
    name: string
  } | null
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<SequenceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSequence, setEditingSequence] = useState<SequenceTemplate | null>(null)

  const fetchSequences = async () => {
    try {
      const response = await fetch('/api/sequences')
      if (!response.ok) throw new Error('Failed to fetch sequences')
      const data = await response.json()
      setSequences(data.sequences)
    } catch (error) {
      console.error('Error fetching sequences:', error)
      toast.error('Failed to load sequences')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSequences()
  }, [])

  const handleCreate = () => {
    setEditingSequence(null)
    setShowForm(true)
  }

  const handleEdit = (sequence: SequenceTemplate) => {
    setEditingSequence(sequence)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sequence? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/sequences/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete sequence')

      toast.success('Sequence deleted successfully')
      fetchSequences()
    } catch (error) {
      console.error('Error deleting sequence:', error)
      toast.error('Failed to delete sequence')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSequence(null)
    fetchSequences()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingSequence(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sequences...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Outreach Sequences</h1>
          <p className="text-gray-600 mt-1">
            Create multi-channel automated outreach sequences
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      {sequences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <h3 className="text-lg font-semibold mb-2">No sequences yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first automated outreach sequence to get started
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Sequence
          </Button>
        </div>
      ) : (
        <SequencesList
          sequences={sequences}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <SequenceForm
          sequence={editingSequence}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}
