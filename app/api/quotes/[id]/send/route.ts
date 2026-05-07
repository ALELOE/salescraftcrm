import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { LeadWithCustomer, Quote, QuoteLineItem } from '@/lib/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { leadId } = await req.json()

  const [quoteRes, leadRes] = await Promise.all([
    supabaseAdmin.from('quotes').select('*').eq('id', params.id).single(),
    supabaseAdmin.from('leads').select('*, customers(*)').eq('id', leadId).single(),
  ])

  if (!quoteRes.data || !leadRes.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const quote = quoteRes.data as Quote
  const lead = leadRes.data as LeadWithCustomer
  const { customers } = lead

  const items = (quote.line_items ?? []) as QuoteLineItem[]
  const netto = quote.total_amount
  const mwst = netto * 0.19
  const brutto = netto * 1.19

  const lineItemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.beschreibung}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.menge}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.einzelpreis)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.menge * item.einzelpreis)}</td>
      </tr>`
    )
    .join('')

  const { error: emailError } = await resend.emails.send({
    from: 'Dachblick <angebote@dachblick.de>',
    to: customers.email,
    subject: `Ihr Angebot von Dachblick — ${quote.id.substring(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1e40af; padding: 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Dachblick</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">Velux Dachfenster Fachbetrieb</p>
        </div>
        <div style="padding: 32px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Sehr geehrte/r ${customers.vorname} ${customers.nachname},</p>
          <p>vielen Dank für Ihr Interesse. Anbei finden Sie unser Angebot:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: white; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #6b7280;">Beschreibung</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #6b7280;">Menge</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #6b7280;">Einzelpreis</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #6b7280;">Gesamt</th>
              </tr>
            </thead>
            <tbody>${lineItemsHtml}</tbody>
          </table>
          <div style="text-align: right; padding: 16px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="color: #6b7280; margin-bottom: 4px;">Netto: ${formatCurrency(netto)}</div>
            <div style="color: #6b7280; margin-bottom: 8px;">MwSt. 19%: ${formatCurrency(mwst)}</div>
            <div style="font-size: 20px; font-weight: bold; color: #1e40af;">Gesamt: ${formatCurrency(brutto)}</div>
            ${quote.valid_until ? `<div style="color: #6b7280; font-size: 12px; margin-top: 8px;">Gültig bis: ${new Date(quote.valid_until).toLocaleDateString('de-DE')}</div>` : ''}
          </div>
          <p style="margin-top: 24px; color: #6b7280;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          <p style="font-weight: 600;">Mit freundlichen Grüßen,<br>Ihr Dachblick Team</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Vielen Dank für Ihr Vertrauen.</p>
        </div>
      </div>
    `,
  })

  if (emailError) {
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }

  await supabaseAdmin
    .from('quotes')
    .update({ status: 'versendet', sent_at: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json({ success: true })
}
