'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { LeadWithCustomer, ActivityWithUser, LeadStatus, User } from '@/lib/types'
import { LEAD_STATUSES, PIPELINE_STEPS, LEAD_STATUS_LABELS } from '@/lib/constants'
import LeadDetailCard from '@/components/leads/LeadDetailCard'
import LeadStatusBadge from '@/components/leads/LeadStatusBadge'
import ActivityTimeline from '@/components/leads/ActivityTimeline'
import AddNoteForm from '@/components/leads/AddNoteForm'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { FileText, Calendar } from 'lucide-react'

const BTN_GHOST: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
  background: 'transparent', color: '#0a0a0a',
  border: '1px solid #ececec', borderRadius: 4,
  padding: '7px 14px', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  textDecoration: 'none', letterSpacing: '-0.005em',
}

const SELECT_STYLE: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '8px 28px 8px 10px',
  borderRadius: 4, border: '1px solid #ececec', background: '#fff',
  color: '#0a0a0a', letterSpacing: '-0.005em', outline: 'none',
  appearance: 'none', width: '100%', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
}

const CARD: React.CSSProperties = {
  background: '#fff', border: '1px solid #ececec', borderRadius: 6,
}

const CARD_HEADER: React.CSSProperties = {
  padding: '14px 20px', borderBottom: '1px solid #ececec',
  fontSize: 14, fontWeight: 500, color: '#525252',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [lead, setLead] = useState<LeadWithCustomer | null>(null)
  const [activities, setActivities] = useState<ActivityWithUser[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)
  const [assignChanging, setAssignChanging] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const [leadRes, activitiesRes, usersRes] = await Promise.all([
      supabase.from('leads').select('*, customers(*)').eq('id', id).single(),
      supabase.from('activities').select('*, users(*)').eq('lead_id', id).order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('name'),
    ])

    if (leadRes.data) setLead(leadRes.data as LeadWithCustomer)
    if (activitiesRes.data) setActivities(activitiesRes.data as ActivityWithUser[])
    if (usersRes.data) setUsers(usersRes.data as User[])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead || newStatus === lead.status) return
    setStatusChanging(true)
    const supabase = createClient()
    const oldStatus = lead.status

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('Fehler beim Ändern des Status')
      setStatusChanging(false)
      return
    }

    await supabase.from('activities').insert({
      lead_id: id,
      user_id: currentUserId,
      type: 'status_aenderung',
      note: `Status geändert: ${LEAD_STATUS_LABELS[oldStatus]} → ${LEAD_STATUS_LABELS[newStatus]}`,
    })

    toast.success(`Status auf "${LEAD_STATUS_LABELS[newStatus]}" geändert`)
    setStatusChanging(false)
    fetchData()
  }

  async function handleAssign(userId: string) {
    setAssignChanging(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: userId, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('Fehler beim Zuweisen')
    } else {
      const assignedUser = users.find((u) => u.id === userId)
      toast.success(`Zugewiesen an ${assignedUser?.name ?? 'Nutzer'}`)
      fetchData()
    }
    setAssignChanging(false)
  }

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ height: 40, background: '#f5f5f5', borderRadius: 4, marginBottom: 24, width: 240 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 280, background: '#f5f5f5', borderRadius: 6 }} />
          ))}
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
        Lead nicht gefunden
      </div>
    )
  }

  const currentStepIndex = PIPELINE_STEPS.indexOf(lead.status)

  return (
    <div>
      {/* Page topbar */}
      <header style={{
        height: 48, background: '#fff', borderBottom: '1px solid #ececec',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3a3a3', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#0a0a0a' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#a3a3a3' }}
          >
            Leads
          </button>
          <span style={{ color: '#a3a3a3' }}>/</span>
          <span style={{ color: '#0a0a0a', fontWeight: 500 }}>
            {lead.customers.vorname} {lead.customers.nachname}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href={`/leads/${id}/angebot`} style={{ ...BTN_GHOST, fontSize: 13 }}>
            <FileText size={14} />
            Angebot erstellen
          </a>
          <button
            style={{ ...BTN_GHOST, fontSize: 13 }}
            onClick={() => setAppointmentOpen(true)}
          >
            <Calendar size={14} />
            Termin vereinbaren
          </button>
        </div>
      </header>

      <div style={{ padding: 32 }}>
        {/* Stepper */}
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececec', fontSize: 14, fontWeight: 500, color: '#525252', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Pipeline</span>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
              {PIPELINE_STEPS.map((step, i) => {
                const done = i < currentStepIndex
                const isCur = step === lead.status
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, position: 'relative' }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%', zIndex: 1,
                      border: `1px solid ${(done || isCur) ? '#0a0a0a' : '#d4d4d4'}`,
                      background: (done || isCur) ? '#0a0a0a' : '#fff',
                      boxShadow: isCur ? '0 0 0 4px rgba(10,10,10,0.08)' : 'none',
                    }} />
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div style={{
                        position: 'absolute', top: 6, left: '50%', right: '-50%', height: 1, zIndex: 0,
                        background: done ? '#0a0a0a' : '#d4d4d4',
                      }} />
                    )}
                    <div style={{
                      fontSize: 11, textAlign: 'center', lineHeight: 1.3, maxWidth: 90,
                      color: (done || isCur) ? '#0a0a0a' : '#a3a3a3',
                      fontWeight: (isCur || done) ? 500 : 400,
                    }}>
                      {LEAD_STATUS_LABELS[step]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Three-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 320px', gap: 16, alignItems: 'start' }}>
          {/* Col 1 — Customer & Lead Details */}
          <LeadDetailCard lead={lead} />

          {/* Col 2 — Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={CARD}>
              <div style={CARD_HEADER}>Status ändern</div>
              <div style={{ padding: 16 }}>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  disabled={statusChanging}
                  style={SELECT_STYLE}
                  onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
                  onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={CARD}>
              <div style={CARD_HEADER}>Zugewiesen an</div>
              <div style={{ padding: 16 }}>
                <select
                  value={lead.assigned_to ?? ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={assignChanging}
                  style={SELECT_STYLE}
                  onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
                  onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
                >
                  <option value="">Nicht zugewiesen</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Col 3 — Activities */}
          <div style={CARD}>
            <div style={CARD_HEADER}>Aktivitäten</div>
            <div style={{ padding: 20 }}>
              <ActivityTimeline activities={activities} />
              <div style={{ borderTop: '1px solid #ececec', marginTop: activities.length > 0 ? 16 : 0, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#525252', marginBottom: 10 }}>
                  Notiz hinzufügen
                </div>
                <AddNoteForm
                  leadId={id}
                  userId={currentUserId}
                  onAdded={fetchData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment modal */}
      {appointmentOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setAppointmentOpen(false)}
        >
          <div
            style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, padding: 24, width: 400, maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.01em' }}>
              Termin vereinbaren
            </div>
            <AppointmentForm
              leadId={id}
              userId={currentUserId}
              onSaved={() => { fetchData(); setAppointmentOpen(false) }}
              onClose={() => setAppointmentOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
