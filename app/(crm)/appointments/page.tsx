import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import TopBar from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/constants'
import MarkCompleteButton from './MarkCompleteButton'
import { AppointmentType } from '@/lib/types'

interface AppointmentRow {
  id: string
  type: AppointmentType
  scheduled_at: string
  duration_minutes: number
  location: string | null
  completed_at: string | null
  leads: { customers: { vorname: string; nachname: string } } | null
}

export default async function AppointmentsPage() {
  const supabase = createClient()

  const { data } = await supabase
    .from('appointments')
    .select('*, leads(customers(*))')
    .order('scheduled_at', { ascending: true })

  const appointments = (data ?? []) as AppointmentRow[]

  const upcoming = appointments.filter((a) => !a.completed_at)
  const completed = appointments.filter((a) => !!a.completed_at)

  return (
    <div>
      <TopBar
        title="Termine"
        subtitle={`${upcoming.length} anstehend · ${completed.length} abgeschlossen`}
      />

      <div className="p-6 lg:p-8 space-y-6">
        {upcoming.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            Keine Termine geplant
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Anstehend</h2>
            <div className="bg-white rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kunde</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Datum & Zeit</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Adresse</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((appt) => (
                    <tr key={appt.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {APPOINTMENT_TYPE_LABELS[appt.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {appt.leads?.customers
                          ? `${appt.leads.customers.vorname} ${appt.leads.customers.nachname}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(appt.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                        <div className="text-xs text-gray-400">{appt.duration_minutes} Min.</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{appt.location ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                          Offen
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <MarkCompleteButton appointmentId={appt.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Abgeschlossen</h2>
            <div className="bg-white rounded-lg border overflow-x-auto opacity-70">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kunde</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Datum & Zeit</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((appt) => (
                    <tr key={appt.id} className="border-b">
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {APPOINTMENT_TYPE_LABELS[appt.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {appt.leads?.customers
                          ? `${appt.leads.customers.vorname} ${appt.leads.customers.nachname}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(appt.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                          Abgeschlossen
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
