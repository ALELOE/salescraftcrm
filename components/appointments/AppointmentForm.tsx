'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { AppointmentType } from '@/lib/types'

interface AppointmentFormProps {
  leadId: string
  userId: string
  onSaved: () => void
  onClose: () => void
}

export default function AppointmentForm({ leadId, userId, onSaved, onClose }: AppointmentFormProps) {
  const [type, setType] = useState<AppointmentType>('aufmass')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(120)
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduledAt) return

    setLoading(true)
    const supabase = createClient()

    const { error: apptError } = await supabase
      .from('appointments')
      .insert({
        lead_id: leadId,
        assigned_to: userId,
        type,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        location: location || null,
        notes: notes || null,
      })
    if (apptError) {
      toast.error('Fehler beim Speichern des Termins')
      setLoading(false)
      return
    }

    await supabase.from('activities').insert({
      lead_id: leadId,
      user_id: userId,
      type: 'termin_vereinbart',
      note: `Termin vereinbart: ${type === 'aufmass' ? 'Aufmaß' : 'Montage'} am ${new Date(scheduledAt).toLocaleDateString('de-DE')}`,
    })

    toast.success('Termin wurde gespeichert')
    onSaved()
    onClose()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Typ</Label>
        <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aufmass">Aufmaß</SelectItem>
            <SelectItem value="montage">Montage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Datum & Uhrzeit</Label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Dauer (Minuten)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={15}
          step={15}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Adresse / Ort</Label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Adresse eingeben..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Notizen</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optionale Notizen..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={loading || !scheduledAt}>
          {loading ? 'Speichern...' : 'Termin speichern'}
        </Button>
      </div>
    </form>
  )
}
