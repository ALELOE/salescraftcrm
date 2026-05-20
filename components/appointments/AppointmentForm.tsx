'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AppointmentType } from '@/lib/types'

const INPUT: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
  borderRadius: 4, border: '1px solid #ececec', background: '#fff',
  color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em',
}

const SELECT_STYLE: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '8px 28px 8px 10px',
  borderRadius: 4, border: '1px solid #ececec', background: '#fff',
  color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em',
  appearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
}

const LABEL: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#525252', display: 'block', marginBottom: 6,
}

const BTN_GHOST: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
  background: 'transparent', color: '#0a0a0a',
  border: '1px solid #ececec', borderRadius: 4,
  padding: '7px 14px', cursor: 'pointer', letterSpacing: '-0.005em',
}

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

    const { error: apptError } = await supabase.from('appointments').insert({
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={LABEL}>Typ</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AppointmentType)}
          style={SELECT_STYLE}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        >
          <option value="aufmass">Aufmaß</option>
          <option value="montage">Montage</option>
        </select>
      </div>

      <div>
        <label style={LABEL}>Datum & Uhrzeit</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
          style={INPUT}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <div>
        <label style={LABEL}>Dauer (Minuten)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={15}
          step={15}
          style={INPUT}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <div>
        <label style={LABEL}>Adresse / Ort</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Adresse eingeben…"
          style={INPUT}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <div>
        <label style={LABEL}>Notizen</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optionale Notizen…"
          rows={3}
          style={{ ...INPUT, resize: 'vertical', minHeight: 72, padding: '10px 12px', lineHeight: 1.5 }}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button
          type="button"
          onClick={onClose}
          style={BTN_GHOST}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={loading || !scheduledAt}
          style={{
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: loading || !scheduledAt ? '#f5f5f5' : '#0a0a0a',
            color: loading || !scheduledAt ? '#a3a3a3' : '#fff',
            border: 'none', borderRadius: 4,
            padding: '7px 14px', cursor: loading || !scheduledAt ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.005em',
          }}
        >
          {loading ? 'Speichern…' : 'Termin speichern'}
        </button>
      </div>
    </form>
  )
}
