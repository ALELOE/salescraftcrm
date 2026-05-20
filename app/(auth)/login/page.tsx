'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      padding: 24,
    }}>
      <div style={{
        width: 360,
        background: '#fff',
        border: '1px solid #ececec',
        borderRadius: 6,
        padding: 32,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: '#0a0a0a' }}>
            SalesCraft
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#a3a3a3' }}>
            Dachblick CRM
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="E-Mail">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@dachblick.de"
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Passwort">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              background: loading ? '#525252' : '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '9px 14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              letterSpacing: '-0.005em',
              transition: 'background 150ms',
            }}
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#525252' }}>{label}</label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        fontFamily: 'inherit',
        fontSize: 13,
        padding: '8px 10px',
        borderRadius: 4,
        border: '1px solid #ececec',
        background: '#fff',
        color: '#0a0a0a',
        width: '100%',
        letterSpacing: '-0.005em',
        outline: 'none',
        transition: 'border-color 150ms',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#0a0a0a'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#ececec'
        props.onBlur?.(e)
      }}
    />
  )
}
