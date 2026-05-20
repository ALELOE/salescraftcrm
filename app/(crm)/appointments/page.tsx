import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import TopBar from '@/components/layout/TopBar'
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

const TH: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 500,
  color: '#525252',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '12px 16px',
  borderBottom: '1px solid #ececec',
  whiteSpace: 'nowrap',
}

const TD: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid #ececec',
  fontSize: 13,
  verticalAlign: 'middle',
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
        subtitle={upcoming.length > 0 ? `${upcoming.length} anstehend` : undefined}
      />

      <div style={{ padding: 32 }}>
        {upcoming.length === 0 && completed.length === 0 && (
          <div style={{ padding: '36px 20px', textAlign: 'center', border: '1px dashed #ececec', borderRadius: 6, color: '#a3a3a3', fontSize: 13 }}>
            Keine offenen Termine. Planen Sie einen über die Lead-Detailseite.
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              Anstehend
            </div>
            <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>Typ</th>
                    <th style={TH}>Kunde</th>
                    <th style={TH}>Datum & Zeit</th>
                    <th style={TH}>Adresse</th>
                    <th style={TH}></th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((appt, i) => {
                    const isLast = i === upcoming.length - 1
                    const tdStyle = isLast ? { ...TD, borderBottom: 'none' } : TD
                    return (
                      <tr key={appt.id} className="sc-row-hover">
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 500,
                            padding: '2px 7px', borderRadius: 2,
                            border: '1px solid #ececec', color: '#525252', background: '#fafafa',
                          }}>
                            {APPOINTMENT_TYPE_LABELS[appt.type]}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500, color: '#0a0a0a' }}>
                          {appt.leads?.customers
                            ? `${appt.leads.customers.vorname} ${appt.leads.customers.nachname}`
                            : '—'}
                        </td>
                        <td style={{ ...tdStyle, color: '#525252' }}>
                          <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {format(new Date(appt.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                          </div>
                          <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 1 }}>{appt.duration_minutes} Min.</div>
                        </td>
                        <td style={{ ...tdStyle, color: '#525252' }}>{appt.location ?? '—'}</td>
                        <td style={{ ...tdStyle, paddingRight: 12 }}>
                          <MarkCompleteButton appointmentId={appt.id} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div style={{ opacity: 0.65 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              Abgeschlossen
            </div>
            <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>Typ</th>
                    <th style={TH}>Kunde</th>
                    <th style={TH}>Datum & Zeit</th>
                    <th style={TH}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((appt, i) => {
                    const isLast = i === completed.length - 1
                    const tdStyle = isLast ? { ...TD, borderBottom: 'none' } : TD
                    return (
                      <tr key={appt.id}>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 500,
                            padding: '2px 7px', borderRadius: 2,
                            border: '1px solid #ececec', color: '#525252', background: '#fafafa',
                          }}>
                            {APPOINTMENT_TYPE_LABELS[appt.type]}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500, color: '#0a0a0a' }}>
                          {appt.leads?.customers
                            ? `${appt.leads.customers.vorname} ${appt.leads.customers.nachname}`
                            : '—'}
                        </td>
                        <td style={{ ...tdStyle, color: '#525252', fontVariantNumeric: 'tabular-nums' }}>
                          {format(new Date(appt.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                            <span style={{ fontSize: 13, color: '#0a0a0a' }}>Abgeschlossen</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
