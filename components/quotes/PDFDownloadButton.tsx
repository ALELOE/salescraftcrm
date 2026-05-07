'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QuotePDF from './QuotePDF'
import { LeadWithCustomer, QuoteLineItem } from '@/lib/types'

interface PDFDownloadButtonProps {
  lead: LeadWithCustomer
  items: QuoteLineItem[]
  total: number
  validUntil: string
  quoteId: string
}

export default function PDFDownloadButton({ lead, items, total, validUntil, quoteId }: PDFDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <QuotePDF
          lead={lead}
          items={items}
          total={total}
          validUntil={validUntil}
          quoteId={quoteId}
        />
      }
      fileName={`angebot-${quoteId.substring(0, 8)}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Generieren...' : 'PDF exportieren'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
