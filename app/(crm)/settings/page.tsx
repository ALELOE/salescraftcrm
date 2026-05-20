import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/layout/TopBar'
import { User } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import AddUserForm from './AddUserForm'

const TH: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11, fontWeight: 500, color: '#525252',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  padding: '12px 16px', borderBottom: '1px solid #ececec',
}

const TD: React.CSSProperties = {
  padding: '14px 16px', borderBottom: '1px solid #ececec',
  fontSize: 13, verticalAlign: 'middle',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  sales: 'Vertrieb',
}

export default async function SettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div>
        <TopBar title="Einstellungen" />
        <div style={{ padding: 32, textAlign: 'center', color: '#a3a3a3', fontSize: 13, paddingTop: 64 }}>
          Kein Zugriff. Diese Seite ist nur für Administratoren.
        </div>
      </div>
    )
  }

  const { data: users } = await supabase.from('users').select('*').order('created_at')
  const allUsers = (users ?? []) as User[]

  return (
    <div>
      <TopBar title="Einstellungen" />

      <div style={{ padding: 32, maxWidth: 960 }}>
        {/* Add user card */}
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, marginBottom: 24 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececec' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#525252' }}>Benutzer hinzufügen</div>
            <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>
              Der neue Nutzer erhält eine E-Mail mit einem temporären Passwort.
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <AddUserForm />
          </div>
        </div>

        {/* Users table */}
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececec' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#525252' }}>
              Alle Benutzer ({allUsers.length})
            </span>
          </div>
          {allUsers.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
              Keine Benutzer gefunden.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Name</th>
                  <th style={TH}>E-Mail</th>
                  <th style={TH}>Rolle</th>
                  <th style={TH}>Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u, i) => {
                  const isLast = i === allUsers.length - 1
                  const tdStyle = isLast ? { ...TD, borderBottom: 'none' } : TD
                  return (
                    <tr key={u.id}>
                      <td style={{ ...tdStyle, fontWeight: 500, color: '#0a0a0a' }}>{u.name}</td>
                      <td style={{ ...tdStyle, color: '#525252' }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', fontSize: 11, fontWeight: 500,
                          padding: '2px 7px', borderRadius: 2,
                          border: '1px solid #ececec', color: '#525252', background: '#fafafa',
                        }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#a3a3a3', fontVariantNumeric: 'tabular-nums' }}>
                        {format(new Date(u.created_at), 'dd.MM.yyyy', { locale: de })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
