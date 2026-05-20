'use client'

import { useState } from 'react'
import { toast } from 'sonner'

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

export default function AddUserForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'sales'>('sales')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    })

    if (res.ok) {
      toast.success('Benutzer erstellt. Passwort wird per E-Mail zugesendet.')
      setName('')
      setEmail('')
      setRole('sales')
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Fehler beim Erstellen des Benutzers')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      <div>
        <label style={LABEL}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Max Mustermann"
          required
          style={INPUT}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <div>
        <label style={LABEL}>E-Mail-Adresse</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="max@dachblick.de"
          required
          style={INPUT}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        />
      </div>

      <div>
        <label style={LABEL}>Rolle</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'sales')}
          style={SELECT_STYLE}
          onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
          onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
        >
          <option value="sales">Vertrieb</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: loading ? '#f5f5f5' : '#0a0a0a',
            color: loading ? '#a3a3a3' : '#fff',
            border: 'none', borderRadius: 4,
            padding: '7px 14px', cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.005em',
          }}
        >
          {loading ? 'Erstellen…' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  )
}
