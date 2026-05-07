'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { ActivityType } from '@/lib/types'

interface AddNoteFormProps {
  leadId: string
  userId: string
  onAdded: () => void
}

export default function AddNoteForm({ leadId, userId, onAdded }: AddNoteFormProps) {
  const [type, setType] = useState<ActivityType>('notiz')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('activities').insert({
      lead_id: leadId,
      user_id: userId,
      type,
      note: note.trim(),
    })

    if (error) {
      toast.error('Fehler beim Speichern der Notiz')
    } else {
      toast.success('Notiz hinzugefügt')
      setNote('')
      setType('notiz')
      onAdded()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Typ</Label>
        <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="notiz">Notiz</SelectItem>
            <SelectItem value="anruf">Anruf</SelectItem>
            <SelectItem value="email">E-Mail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Anmerkung</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notiz eingeben..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading || !note.trim()} className="w-full">
        {loading ? 'Speichern...' : 'Notiz hinzufügen'}
      </Button>
    </form>
  )
}
