'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
// createClient is used only to fetch the users list
import { X } from 'lucide-react'

const ZUBEHOER_OPTIONS = [
  'Rollladen',
  'Mückennetz',
  'Verdunkelungsrollo',
  'Hitzeschutz-Markise',
  'Eindeckrahmen EDW',
  'Insektenschutz',
]

const QUELLEN: { label: string; value: string }[] = [
  { label: 'Telefon', value: 'phone' },
  { label: 'Website', value: 'website' },
  { label: 'Empfehlung', value: 'referral' },
  { label: 'Messe', value: 'trade_show' },
  { label: 'Sonstiges', value: 'other' },
]

const INPUT: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
  borderRadius: 4, border: '1px solid #ececec', background: '#fff',
  color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em',
  transition: 'border-color 150ms',
}

const SELECT_STYLE: React.CSSProperties = {
  ...({ fontFamily: 'inherit', fontSize: 13, padding: '8px 28px 8px 10px', borderRadius: 4, border: '1px solid #ececec', background: '#fff', color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em', appearance: 'none', cursor: 'pointer', transition: 'border-color 150ms' } as React.CSSProperties),
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
}

const LABEL: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#525252', display: 'block', marginBottom: 6,
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: '#a3a3a3',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  marginBottom: 12, marginTop: 24,
}

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth: 0 }}>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#0a0a0a'
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#ececec'
}

interface CreateLeadModalProps {
  onClose: () => void
  onCreated: () => void
}

export default function CreateLeadModal({ onClose, onCreated }: CreateLeadModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  // Customer fields
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [plz, setPlz] = useState('')
  const [city, setCity] = useState('')

  // Lead fields
  const [massnahme, setMassnahme] = useState<'austausch' | 'neueinbau'>('austausch')
  const [anzahlFenster, setAnzahlFenster] = useState(1)
  const [quelle, setQuelle] = useState('phone')
  const [assignedTo, setAssignedTo] = useState('')

  // Austausch-specific
  const [typenschild, setTypenschild] = useState('')
  const [breite, setBreite] = useState('')
  const [hoehe, setHoehe] = useState('')

  // Neueinbau-specific
  const [rohbauBreite, setRohbauBreite] = useState('')
  const [rohbauHoehe, setRohbauHoehe] = useState('')
  const [dachneigung, setDachneigung] = useState('')

  // Shared
  const [zubehoer, setZubehoer] = useState<string[]>([])
  const [anmerkungen, setAnmerkungen] = useState('')

  useEffect(() => {
    createClient().from('users').select('*').order('name').then(({ data }) => {
      if (data) setUsers(data as User[])
    })
  }, [])

  function toggleZubehoer(item: string) {
    setZubehoer((prev) =>
      prev.includes(item) ? prev.filter((z) => z !== item) : [...prev, item]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const leadPayload = {
      massnahme,
      anzahl_fenster: anzahlFenster,
      source: quelle,
      assigned_to: assignedTo || null,
      zubehoer,
      anmerkungen: anmerkungen || null,
      ...(massnahme === 'austausch'
        ? {
            typenschild: typenschild || null,
            fenster_breite_cm: breite ? Number(breite) : null,
            fenster_hoehe_cm: hoehe ? Number(hoehe) : null,
          }
        : {
            rohbau_breite_cm: rohbauBreite ? Number(rohbauBreite) : null,
            rohbau_hoehe_cm: rohbauHoehe ? Number(rohbauHoehe) : null,
            dachneigung: dachneigung || null,
          }),
    }

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { vorname, nachname, email, phone: phone || null, plz, city: city || '' },
        lead: leadPayload,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error ?? 'Fehler beim Anlegen des Leads.')
      setLoading(false)
      return
    }

    toast.success(`Lead „${vorname} ${nachname}" angelegt.`)
    onCreated()
    onClose()
    router.push(`/leads/${json.lead_id}`)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', border: '1px solid #ececec', borderRadius: 6,
          width: '100%', maxWidth: 600, flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #ececec',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: '#0a0a0a' }}>
            Neuer Lead
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3a3a3', padding: 4, display: 'flex', borderRadius: 4 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#0a0a0a' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#a3a3a3' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {/* ── Kundendaten ── */}
          <div style={SECTION_TITLE}>Kundendaten</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Vorname *" half>
              <input value={vorname} onChange={(e) => setVorname(e.target.value)} required style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Nachname *" half>
              <input value={nachname} onChange={(e) => setNachname(e.target.value)} required style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="E-Mail *" half>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Telefon" half>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 89 …" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="PLZ *" half>
              <input value={plz} onChange={(e) => setPlz(e.target.value)} required placeholder="80331" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Stadt" half>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="München" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>

          {/* ── Leaddaten ── */}
          <div style={SECTION_TITLE}>Leaddaten</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Maßnahme *" half>
              <select value={massnahme} onChange={(e) => setMassnahme(e.target.value as 'austausch' | 'neueinbau')} style={SELECT_STYLE} onFocus={onFocus} onBlur={onBlur}>
                <option value="austausch">Austausch</option>
                <option value="neueinbau">Neueinbau</option>
              </select>
            </Field>
            <Field label="Anzahl Fenster *" half>
              <input type="number" min={1} value={anzahlFenster} onChange={(e) => setAnzahlFenster(Number(e.target.value))} required style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Quelle" half>
              <select value={quelle} onChange={(e) => setQuelle(e.target.value)} style={SELECT_STYLE} onFocus={onFocus} onBlur={onBlur}>
                {QUELLEN.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
              </select>
            </Field>
            <Field label="Zugewiesen an" half>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={SELECT_STYLE} onFocus={onFocus} onBlur={onBlur}>
                <option value="">Nicht zugewiesen</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          </div>

          {/* ── Maße (conditional) ── */}
          {massnahme === 'austausch' && (
            <>
              <div style={SECTION_TITLE}>Fenstermaße (Austausch)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <Field label="Typenschild">
                  <input value={typenschild} onChange={(e) => setTypenschild(e.target.value)} placeholder="z.B. GGL MK06" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                </Field>
                <Field label="Breite (cm)" half>
                  <input type="number" min={1} value={breite} onChange={(e) => setBreite(e.target.value)} placeholder="78" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                </Field>
                <Field label="Höhe (cm)" half>
                  <input type="number" min={1} value={hoehe} onChange={(e) => setHoehe(e.target.value)} placeholder="118" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                </Field>
              </div>
            </>
          )}

          {massnahme === 'neueinbau' && (
            <>
              <div style={SECTION_TITLE}>Rohbaumaße (Neueinbau)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <Field label="Breite (cm)" half>
                  <input type="number" min={1} value={rohbauBreite} onChange={(e) => setRohbauBreite(e.target.value)} placeholder="94" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                </Field>
                <Field label="Höhe (cm)" half>
                  <input type="number" min={1} value={rohbauHoehe} onChange={(e) => setRohbauHoehe(e.target.value)} placeholder="140" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                </Field>
                <Field label="Dachneigung">
                  <input value={dachneigung} onChange={(e) => setDachneigung(e.target.value)} placeholder="z.B. 35°" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                </Field>
              </div>
            </>
          )}

          {/* ── Zubehör ── */}
          <div style={SECTION_TITLE}>Zubehör</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            {ZUBEHOER_OPTIONS.map((item) => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0a0a0a', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={zubehoer.includes(item)}
                  onChange={() => toggleZubehoer(item)}
                  style={{ accentColor: '#0a0a0a', width: 14, height: 14, cursor: 'pointer' }}
                />
                {item}
              </label>
            ))}
          </div>

          {/* ── Anmerkungen ── */}
          <div style={{ ...SECTION_TITLE, marginTop: 20 }}>Anmerkungen</div>
          <textarea
            value={anmerkungen}
            onChange={(e) => setAnmerkungen(e.target.value)}
            placeholder="Optionale Hinweise zum Lead…"
            rows={3}
            style={{ ...INPUT, resize: 'vertical', minHeight: 72, padding: '10px 12px', lineHeight: 1.5 }}
            onFocus={onFocus}
            onBlur={onBlur}
          />

          {/* ── Actions ── */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #ececec' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                background: 'transparent', color: '#0a0a0a',
                border: '1px solid #ececec', borderRadius: 4,
                padding: '7px 16px', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                background: loading ? '#525252' : '#0a0a0a',
                color: '#fff', border: 'none', borderRadius: 4,
                padding: '7px 16px', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Wird gespeichert…' : 'Lead erfassen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
