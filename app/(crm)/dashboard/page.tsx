import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LeadTable from '@/components/leads/LeadTable'
import LeadStatusBadge from '@/components/leads/LeadStatusBadge'
import TopBar from '@/components/layout/TopBar'
import { LEAD_STATUSES } from '@/lib/constants'
import { LeadStatus, LeadWithCustomer } from '@/lib/types'
import { TrendingUp, Users, Clock, Target } from 'lucide-react'

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

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: leadsRaw } = await supabase
    .from('leads')
    .select('*, customers(*)')
    .order('created_at', { ascending: false })

  const leads = (leadsRaw ?? []) as LeadWithCustomer[]
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const weekStart = startOfWeek(now).toISOString()

  const leadsToday = leads.filter((l) => l.created_at >= todayStart).length
  const leadsWeek = leads.filter((l) => l.created_at >= weekStart).length
  const openLeads = leads.filter((l) => !['gewonnen', 'verloren'].includes(l.status)).length
  const wonLeads = leads.filter((l) => l.status === 'gewonnen').length
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

  const statusCounts = LEAD_STATUSES.reduce((acc, s) => {
    acc[s.value] = leads.filter((l) => l.status === s.value).length
    return acc
  }, {} as Record<LeadStatus, number>)

  const recentLeads = leads.slice(0, 10)

  return (
    <div>
      <TopBar title="Dashboard" subtitle="Übersicht Ihrer Vertriebsaktivitäten" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Leads heute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-gray-900">{leadsToday}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Leads diese Woche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-gray-900">{leadsWeek}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Offene Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-gray-900">{openLeads}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-gray-900">{conversionRate}%</span>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {LEAD_STATUSES.map((s) => (
                <div key={s.value} className="flex items-center gap-2">
                  <LeadStatusBadge status={s.value} />
                  <span className="text-sm font-bold text-gray-700">
                    {statusCounts[s.value]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neueste Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LeadTable leads={recentLeads} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
