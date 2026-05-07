'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadWithCustomer } from '@/lib/types'
import { LEAD_STATUSES } from '@/lib/constants'
import LeadTable from '@/components/leads/LeadTable'
import TopBar from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('alle')
  const [massnahmeFilter, setMassnahmeFilter] = useState<string>('alle')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('leads')
      .select('*, customers(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (statusFilter !== 'alle') {
      query = query.eq('status', statusFilter)
    }
    if (massnahmeFilter !== 'alle') {
      query = query.eq('massnahme', massnahmeFilter)
    }

    const { data, count } = await query
    let results = (data ?? []) as LeadWithCustomer[]

    if (search.trim()) {
      const s = search.toLowerCase()
      results = results.filter(
        (l) =>
          `${l.customers.vorname} ${l.customers.nachname}`.toLowerCase().includes(s) ||
          l.customers.email.toLowerCase().includes(s) ||
          l.customers.plz.includes(s)
      )
    }

    setLeads(results)
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, statusFilter, massnahmeFilter, search])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <TopBar title="Leads" subtitle={`${total} Lead${total !== 1 ? 's' : ''} gesamt`} />

      <div className="p-6 lg:p-8 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Name, E-Mail oder PLZ suchen..."
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Status</SelectItem>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={massnahmeFilter} onValueChange={(v) => { setMassnahmeFilter(v); setPage(0) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Maßnahme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle</SelectItem>
              <SelectItem value="austausch">Austausch</SelectItem>
              <SelectItem value="neueinbau">Neueinbau</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border">
          <LeadTable leads={leads} loading={loading} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} von {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
