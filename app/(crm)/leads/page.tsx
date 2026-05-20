'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadWithCustomer } from '@/lib/types'
import { LEAD_STATUSES } from '@/lib/constants'
import LeadTable from '@/components/leads/LeadTable'
import TopBar from '@/components/layout/TopBar'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

const BTN_GHOST: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  background: 'transparent',
  color: '#0a0a0a',
  border: '1px solid #ececec',
  borderRadius: 4,
  padding: '7px 12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  transition: 'background 150ms',
}

const SELECT_STYLE: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 13,
  padding: '8px 28px 8px 10px',
  borderRadius: 4,
  border: '1px solid #ececec',
  background: '#fff',
  color: '#0a0a0a',
  letterSpacing: '-0.005em',
  outline: 'none',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  cursor: 'pointer',
}

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

    if (statusFilter !== 'alle') query = query.eq('status', statusFilter)
    if (massnahmeFilter !== 'alle') query = query.eq('massnahme', massnahmeFilter)

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

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <TopBar
        title="Leads"
        subtitle={total > 0 ? `${total} Lead${total !== 1 ? 's' : ''}` : undefined}
      />

      <div style={{ padding: 32 }}>
        {/* Filter row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a3a3a3', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Nach Name, E-Mail, PLZ suchen…"
              style={{
                fontFamily: 'inherit', fontSize: 13, padding: '8px 10px 8px 32px',
                borderRadius: 4, border: '1px solid #ececec', background: '#fff',
                color: '#0a0a0a', width: '100%', outline: 'none', letterSpacing: '-0.005em',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
              onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            style={{ ...SELECT_STYLE, minWidth: 180 }}
            onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
            onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
          >
            <option value="alle">Alle Status</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={massnahmeFilter}
            onChange={(e) => { setMassnahmeFilter(e.target.value); setPage(0) }}
            style={{ ...SELECT_STYLE, minWidth: 160 }}
            onFocus={(e) => { e.target.style.borderColor = '#0a0a0a' }}
            onBlur={(e) => { e.target.style.borderColor = '#ececec' }}
          >
            <option value="alle">Alle Maßnahmen</option>
            <option value="austausch">Austausch</option>
            <option value="neueinbau">Neueinbau</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6 }}>
          <LeadTable leads={leads} loading={loading} />

          {/* Pagination footer */}
          {totalPages > 1 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #ececec',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#a3a3a3',
            }}>
              <span>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} von {total}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={{ ...BTN_GHOST, padding: '5px 8px' }}
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  style={{ ...BTN_GHOST, padding: '5px 8px' }}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
