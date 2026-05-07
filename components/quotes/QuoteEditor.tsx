'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Quote, QuoteLineItem, LeadWithCustomer } from '@/lib/types'
import dynamic from 'next/dynamic'

const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), { ssr: false })

interface QuoteEditorProps {
  leadId: string
  lead: LeadWithCustomer
  userId: string
  existingQuote: Quote | null
}

const emptyItem = (): QuoteLineItem => ({
  beschreibung: '',
  menge: 1,
  einzelpreis: 0,
})

export default function QuoteEditor({ leadId, lead, userId, existingQuote }: QuoteEditorProps) {
  const [items, setItems] = useState<QuoteLineItem[]>(
    existingQuote?.line_items ?? [emptyItem()]
  )
  const [validUntil, setValidUntil] = useState(
    existingQuote?.valid_until?.split('T')[0] ?? ''
  )
  const [quoteId, setQuoteId] = useState(existingQuote?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const total = items.reduce((sum, item) => sum + item.menge * item.einzelpreis, 0)

  function updateItem(index: number, field: keyof QuoteLineItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      lead_id: leadId,
      line_items: items,
      total_amount: total,
      valid_until: validUntil || null,
      status: 'entwurf' as const,
    }

    if (quoteId) {
      const { error } = await supabase
        .from('quotes')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', quoteId)
      if (error) { toast.error('Fehler beim Speichern'); setSaving(false); return }
    } else {
      const { data, error } = await supabase
        .from('quotes')
        .insert(payload)
        .select()
        .single()
      if (error) { toast.error('Fehler beim Speichern'); setSaving(false); return }
      setQuoteId(data.id)

      await supabase.from('activities').insert({
        lead_id: leadId,
        user_id: userId,
        type: 'angebot_erstellt',
        note: `Angebot erstellt (${items.length} Position${items.length !== 1 ? 'en' : ''}, Gesamt: ${formatCurrency(total)})`,
      })
    }

    toast.success('Angebot gespeichert')
    setSaving(false)
  }

  async function handleSend() {
    if (!quoteId) {
      toast.error('Bitte zuerst speichern')
      return
    }

    setSending(true)

    const res = await fetch(`/api/quotes/${quoteId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    })

    if (res.ok) {
      toast.success(`Angebot an ${lead.customers.email} versendet`)
      const supabase = createClient()
      await supabase.from('activities').insert({
        lead_id: leadId,
        user_id: userId,
        type: 'angebot_versendet',
        note: `Angebot per E-Mail an ${lead.customers.email} versendet`,
      })
    } else {
      toast.error('Fehler beim Versenden')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-600 w-1/2">Beschreibung</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600 w-20">Menge</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600 w-32">Einzelpreis (€)</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">Gesamt (€)</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-3 py-2">
                  <Input
                    value={item.beschreibung}
                    onChange={(e) => updateItem(index, 'beschreibung', e.target.value)}
                    placeholder="Positionsbeschreibung"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.menge}
                    onChange={(e) => updateItem(index, 'menge', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={1}
                    className="text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.einzelpreis}
                    onChange={(e) => updateItem(index, 'einzelpreis', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                    className="text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-700">
                  {formatCurrency(item.menge * item.einzelpreis)}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setItems((prev) => [...prev, emptyItem()])}
      >
        <Plus className="h-4 w-4 mr-2" />
        Position hinzufügen
      </Button>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Netto</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>MwSt. 19%</span>
          <span>{formatCurrency(total * 0.19)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Gesamt</span>
          <span>{formatCurrency(total * 1.19)}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Gültig bis</Label>
        <Input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Speichern...' : 'Speichern'}
        </Button>

        <Button variant="outline" onClick={handleSend} disabled={sending || !quoteId}>
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Senden...' : 'Per E-Mail versenden'}
        </Button>

        {quoteId && (
          <PDFDownloadButton lead={lead} items={items} total={total} validUntil={validUntil} quoteId={quoteId} />
        )}
      </div>
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}
