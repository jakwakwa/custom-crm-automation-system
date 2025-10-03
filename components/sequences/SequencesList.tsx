import { SequenceCard } from './SequenceCard'

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

interface SequencesListProps {
  sequences: SequenceTemplate[]
  onEdit: (sequence: SequenceTemplate) => void
  onDelete: (id: string) => void
}

export function SequencesList({ sequences, onEdit, onDelete }: SequencesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sequences.map((sequence) => (
        <SequenceCard
          key={sequence.id}
          sequence={sequence}
          onEdit={() => onEdit(sequence)}
          onDelete={() => onDelete(sequence.id)}
        />
      ))}
    </div>
  )
}
