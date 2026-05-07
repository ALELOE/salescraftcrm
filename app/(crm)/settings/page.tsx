import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import AddUserForm from './AddUserForm'

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
        <div className="p-6 lg:p-8">
          <div className="text-center py-16 text-gray-500">
            Kein Zugriff. Diese Seite ist nur für Administratoren.
          </div>
        </div>
      </div>
    )
  }

  const { data: users } = await supabase.from('users').select('*').order('created_at')
  const allUsers = (users ?? []) as User[]

  return (
    <div>
      <TopBar title="Einstellungen" subtitle="Benutzerverwaltung" />

      <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Benutzer hinzufügen</CardTitle>
            <CardDescription>
              Der neue Nutzer erhält eine E-Mail mit einem temporären Passwort.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddUserForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alle Benutzer ({allUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {allUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Keine Benutzer gefunden</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">E-Mail</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Rolle</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : 'Sales'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {format(new Date(u.created_at), 'dd.MM.yyyy', { locale: de })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
