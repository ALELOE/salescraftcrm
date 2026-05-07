'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
      toast.success(`Benutzer erstellt. Passwort wird per E-Mail zugesendet.`)
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Max Mustermann"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>E-Mail-Adresse</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="max@dachblick.de"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Rolle</Label>
        <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'sales')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Erstellen...' : 'Benutzer hinzufügen'}
      </Button>

      <p className="text-xs text-gray-500">
        Das Passwort wird per E-Mail an den neuen Benutzer zugesendet.
      </p>
    </form>
  )
}
