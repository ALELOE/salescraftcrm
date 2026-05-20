import { createClient } from '@/lib/supabase/server'
import { LeadStatus, LeadWithCustomer } from '@/lib/types'
import TopBar from '@/components/layout/TopBar'
import DashboardGreeting from './DashboardGreeting'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { STATUS_CONFIG } from '@/components/leads/LeadStatusBadge'

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return startOfDay(d)
}

const PIPELINE_ORDER: LeadStatus[] = [
  'neu', 'kontaktiert', 'angebot_versendet', 'termin_geplant', 'angebot_aktualisiert', 'gewonnen', 'verloren',
]

export default async function DashboardPage() {
  const supabase = createClient()

  const [{ data: leadsRaw }, { data: { user } }] = await Promise.all([
    supabase.from('leads').select('*, customers(*)').order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  const leads = (leadsRaw ?? []) as LeadWithCustomer[]
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const weekStart = startOfWeek(now).toISOString()

  const leadsToday = leads.filter((l) => l.created_at >= todayStart).length
  const leadsWeek = leads.filter((l) => l.created_at >= weekStart).length
  const openLeads = leads.filter((l) => !['gewonnen', 'verloren'].includes(l.status))
  const wonLeads = leads.filter((l) => l.status === 'gewonnen').length
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

  const statusCounts = PIPELINE_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length
    return acc
  }, {} as Record<LeadStatus, number>)
  const pipelineTotal = leads.length

  const displayOpen = openLeads.slice(0, 6)

  let firstName = 'Nutzer'
  if (user) {
    const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single()
    firstName = profile?.name?.split(' ')[0] ?? firstName
  }

  return (
    <div>
      <TopBar title="Dashboard" />

      <div style={{ padding: 32 }}>
        <DashboardGreeting firstName={firstName} openLeadsCount={openLeads.length} />

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <KPICard label="Leads heute" num={leadsToday} />
          <KPICard label="Diese Woche" num={leadsWeek} />
          <KPICard label="Offene Leads" num={openLeads.length} />
          <KPICard label="Conversion" num={`${conversionRate}%`} sub="letzte 30 Tage" />
        </div>

        {/* Pipeline */}
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, marginBottom: 24 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececec', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#525252' }}>Pipeline</span>
            <span style={{ fontSize: 12, color: '#a3a3a3', fontVariantNumeric: 'tabular-nums' }}>{pipelineTotal} Leads</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: '#ececec' }}>
              {PIPELINE_ORDER.map((k) => {
                if (!statusCounts[k]) return null
                const w = (statusCounts[k] / Math.max(pipelineTotal, 1)) * 100
                return (
                  <div key={k} style={{ background: STATUS_CONFIG[k]?.color ?? '#a3a3a3', width: `${w}%`, height: '100%' }} />
                )
              })}
            </div>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 16px' }}>
              {PIPELINE_ORDER.map((k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#525252' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CONFIG[k]?.color ?? '#a3a3a3', flexShrink: 0, display: 'inline-block' }} />
                  <span>{STATUS_CONFIG[k]?.label ?? k}</span>
                  <span style={{ marginLeft: 'auto', color: '#0a0a0a', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                    {statusCounts[k] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column bottom */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Offene Leads */}
          <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececec', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#525252' }}>Offene Leads</span>
              <Link href="/leads" className="sc-link" style={{ fontSize: 12 }}>
                Alle anzeigen
              </Link>
            </div>
            {displayOpen.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
                Noch keine offenen Leads.
              </div>
            ) : (
              <div>
                {displayOpen.map((l, i) => {
                  const isLast = i === displayOpen.length - 1
                  const name = `${l.customers.vorname} ${l.customers.nachname}`
                  const color = STATUS_CONFIG[l.status]?.color ?? '#a3a3a3'
                  return (
                    <Link
                      key={l.id}
                      href={`/leads/${l.id}`}
                      className="sc-row-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 20px',
                        borderBottom: isLast ? 'none' : '1px solid #ececec',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a' }}>{name}</div>
                        <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 1 }}>
                          {l.customers.plz} · {l.massnahme === 'austausch' ? 'Austausch' : 'Neueinbau'} · {l.anzahl_fenster} Fenster
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ color: '#a3a3a3', flexShrink: 0 }} />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Aktivität placeholder */}
          <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececec' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#525252' }}>Aktivität</span>
            </div>
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
              Noch keine Aktivität.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, num, sub }: { label: string; num: string | number; sub?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, padding: 18 }}>
      <div style={{ fontSize: 12, color: '#525252', fontWeight: 500 }}>{label}</div>
      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: '#0a0a0a' }}>
          {num}
        </span>
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: '#a3a3a3' }}>{sub}</div>}
    </div>
  )
}
