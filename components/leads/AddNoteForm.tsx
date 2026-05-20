'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ActivityType } from '@/lib/types'

const INPUT: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
  borderRadius: 4, border: '1px solid #ececec', background: '#fff',
  color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em',
  transition: 'border-color 150ms',
}

const SELECT_STYLE: React.CSSProperties = {
  ...{ fontFamily: 'inherit', fontSize: 13, padding: '8px 28px 8px 10px', borderRadius: 4, border: '1px solid #ececec', background: '#fff', color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em', appearance: 'none', cursor: 'pointer' },
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
}

const LABEL: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#525252', display: 'block', marginBottom: 6,
}

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
      toast.error('Fehler beim Speichern')
    } else {
      toast.success('Notiz hinzugefügt')
      setNote('')
      setType('notiz')
      onAdded()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={LABEL}>Typ</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
          style={SELECT_STYLE}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        >
          <option value="notiz">Notiz</option>
          <option value="anruf">Anruf</option>
          <option value="email">E-Mail</option>
        </select>
      </div>

      <div>
        <label style={LABEL}>Anmerkung</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notiz eingeben…"
          rows={3}
          style={{
            ...INPUT,
            resize: 'vertical',
            minHeight: 72,
            lineHeight: 1.5,
            padding: '10px 12px',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !note.trim()}
        style={{
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          background: loading || !note.trim() ? '#f5f5f5' : '#0a0a0a',
          color: loading || !note.trim() ? '#a3a3a3' : '#fff',
          border: 'none', borderRadius: 4,
          padding: '7px 14px', cursor: loading || !note.trim() ? 'not-allowed' : 'pointer',
          width: '100%', letterSpacing: '-0.005em',
        }}
      >
        {loading ? 'Speichern…' : 'Notiz hinzufügen'}
      </button>
    </form>
  )
}
