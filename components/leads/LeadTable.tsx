'use client'

import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { LeadWithCustomer } from '@/lib/types'
import { MASSNAHME_LABELS } from '@/lib/constants'
import LeadStatusBadge from './LeadStatusBadge'
import { ChevronRight } from 'lucide-react'

interface LeadTableProps {
  leads: LeadWithCustomer[]
  loading?: boolean
}

const TH_STYLE: React.CSSProperties = {
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

const TD_STYLE: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid #ececec',
  verticalAlign: 'middle',
  fontSize: 13,
  fontVariantNumeric: 'tabular-nums',
}

export default function LeadTable({ leads, loading }: LeadTableProps) {
  if (loading) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
        Laden…
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div style={{ padding: '36px 20px', textAlign: 'center', border: '1px dashed #ececec', borderRadius: 6, margin: '0 20px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a', marginBottom: 4 }}>Noch keine Leads.</div>
        <div style={{ fontSize: 12, color: '#a3a3a3' }}>Warte auf die erste Anfrage.</div>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={TH_STYLE}>Name</th>
            <th style={TH_STYLE}>PLZ</th>
            <th style={TH_STYLE}>Maßnahme</th>
            <th style={TH_STYLE}>Fenster</th>
            <th style={TH_STYLE}>Status</th>
            <th style={TH_STYLE}>Zugewiesen</th>
            <th style={TH_STYLE}>Erstellt</th>
            <th style={{ ...TH_STYLE, width: 32 }}></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const isLast = i === leads.length - 1
            const tdStyle = isLast
              ? { ...TD_STYLE, borderBottom: 'none' }
              : TD_STYLE
            const name = `${lead.customers.vorname} ${lead.customers.nachname}`

            return (
              <tr
                key={lead.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const cells = e.currentTarget.querySelectorAll('td')
                  cells.forEach((td) => { (td as HTMLElement).style.background = '#fafafa' })
                }}
                onMouseLeave={(e) => {
                  const cells = e.currentTarget.querySelectorAll('td')
                  cells.forEach((td) => { (td as HTMLElement).style.background = 'transparent' })
                }}
                onClick={() => { window.location.href = `/leads/${lead.id}` }}
              >
                <td style={{ ...tdStyle, fontWeight: 500, color: '#0a0a0a' }}>
                  {name}
                </td>
                <td style={{ ...tdStyle, color: '#525252' }}>
                  {lead.customers.plz}
                </td>
                <td style={{ ...tdStyle, color: '#525252' }}>
                  {MASSNAHME_LABELS[lead.massnahme]}
                </td>
                <td style={{ ...tdStyle, color: '#525252' }}>
                  {lead.anzahl_fenster}
                </td>
                <td style={tdStyle}>
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td style={{ ...tdStyle, color: '#525252' }}>
                  {lead.assignedUser?.name ?? '—'}
                </td>
                <td style={{ ...tdStyle, color: '#a3a3a3' }}>
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: de })}
                </td>
                <td style={{ ...tdStyle, color: '#a3a3a3', paddingRight: 12 }}>
                  <ChevronRight size={14} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
