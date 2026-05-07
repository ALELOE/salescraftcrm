'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { LeadWithCustomer, ActivityWithUser, LeadStatus, User } from '@/lib/types'
import { LEAD_STATUSES, PIPELINE_STEPS, LEAD_STATUS_LABELS } from '@/lib/constants'
import LeadDetailCard from '@/components/leads/LeadDetailCard'
import LeadStatusBadge from '@/components/leads/LeadStatusBadge'
import ActivityTimeline from '@/components/leads/ActivityTimeline'
import AddNoteForm from '@/components/leads/AddNoteForm'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="p-6 lg:p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6 lg:p-8 text-center text-gray-500">
        Lead nicht gefunden
      </div>
    )
  }

  const currentStepIndex = PIPELINE_STEPS.indexOf(lead.status)

  return (
    <div>
      <div className="bg-white border-b px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {lead.customers.vorname} {lead.customers.nachname}
            </h1>
            <p className="text-sm text-gray-500">{lead.customers.plz} · Lead #{id.substring(0, 8)}</p>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Column 1 — Customer & Lead Details */}
          <div>
            <LeadDetailCard lead={lead} />
          </div>

          {/* Column 2 — Pipeline & Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PIPELINE_STEPS.map((step, index) => {
                    const isDone = currentStepIndex > index
                    const isCurrent = lead.status === step
                    const isLost = lead.status === 'verloren'

                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            isCurrent && !isLost ? 'bg-blue-600 text-white' :
                            isDone ? 'bg-green-500 text-white' :
                            'bg-gray-200 text-gray-400'
                          )}
                        >
                          {isDone ? '✓' : index + 1}
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            isCurrent ? 'font-semibold text-blue-700' :
                            isDone ? 'text-green-700' : 'text-gray-400'
                          )}
                        >
                          {LEAD_STATUS_LABELS[step]}
                        </span>
                      </div>
                    )
                  })}

                  {lead.status === 'verloren' && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✗</div>
                      <span className="text-sm font-semibold text-red-600">Verloren</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-sm text-gray-500">Status ändern</span>
                  <Select
                    value={lead.status}
                    onValueChange={(v) => handleStatusChange(v as LeadStatus)}
                    disabled={statusChanging}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-sm text-gray-500">Zuweisen an</span>
                  <Select
                    value={lead.assigned_to ?? ''}
                    onValueChange={handleAssign}
                    disabled={assignChanging}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nicht zugewiesen" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button asChild className="w-full" variant="outline">
                  <Link href={`/leads/${id}/angebot`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Angebot erstellen
                  </Link>
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setAppointmentOpen(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Termin planen
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Column 3 — Activities */}
          <div>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActivityTimeline activities={activities} />
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Notiz hinzufügen</h4>
                  <AddNoteForm
                    leadId={id}
                    userId={currentUserId}
                    onAdded={fetchData}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={appointmentOpen} onOpenChange={setAppointmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Termin planen</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            leadId={id}
            userId={currentUserId}
            onSaved={fetchData}
            onClose={() => setAppointmentOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
