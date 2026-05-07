'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { LeadWithCustomer } from '@/lib/types'
import { MASSNAHME_LABELS } from '@/lib/constants'
import LeadStatusBadge from './LeadStatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface LeadTableProps {
  leads: LeadWithCustomer[]
  loading?: boolean
}

export default function LeadTable({ leads, loading }: LeadTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Keine Leads gefunden
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">PLZ</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Maßnahme</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Fenster</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Zugewiesen</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Erstellt</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {lead.customers.vorname} {lead.customers.nachname}
              </td>
              <td className="px-4 py-3 text-gray-600">{lead.customers.plz}</td>
              <td className="px-4 py-3 text-gray-600">
                {MASSNAHME_LABELS[lead.massnahme]}
              </td>
              <td className="px-4 py-3 text-gray-600">{lead.anzahl_fenster}</td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {lead.assignedUser?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {format(new Date(lead.created_at), 'dd.MM.yyyy', { locale: de })}
              </td>
              <td className="px-4 py-3">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/leads/${lead.id}`}>Öffnen</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
