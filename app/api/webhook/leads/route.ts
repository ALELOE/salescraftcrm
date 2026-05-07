import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { WebhookPayload } from '@/lib/types'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  let body: WebhookPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { metadata, customer } = body

  const { data: customerData, error: customerError } = await supabaseAdmin
    .from('customers')
    .insert({
      vorname: customer.vorname,
      nachname: customer.nachname,
      email: customer.email,
      phone: customer.telefon,
      plz: customer.plz,
      city: '',
    })
    .select()
    .single()

  if (customerError) {
    console.error('Customer insert error:', customerError)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }

  const leadInsert: Record<string, string | number | string[] | null> = {
    customer_id: customerData.id,
    status: 'neu',
    source: 'landingpage',
    massnahme: metadata.massnahme,
    anzahl_fenster: metadata.anzahl,
    zubehoer: metadata.zubehoer ?? [],
    anmerkungen: customer.anmerkungen ?? null,
  }

  if (metadata.massnahme === 'austausch') {
    leadInsert.typenschild = metadata.typenschild ?? null
    leadInsert.fenster_breite_cm = metadata.breite
    leadInsert.fenster_hoehe_cm = metadata.hoehe
  } else {
    leadInsert.rohbau_breite_cm = metadata.breite
    leadInsert.rohbau_hoehe_cm = metadata.hoehe
    leadInsert.dachneigung = metadata.dachneigung ?? null
  }

  const { data: leadData, error: leadError } = await supabaseAdmin
    .from('leads')
    .insert(leadInsert)
    .select()
    .single()

  if (leadError) {
    console.error('Lead insert error:', leadError)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }

  await supabaseAdmin.from('activities').insert({
    lead_id: leadData.id,
    user_id: null,
    type: 'status_aenderung',
    note: 'Lead eingegangen via Landingpage',
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const notifyEmail = process.env.INTERNAL_NOTIFY_EMAIL

  if (notifyEmail) {
    const massnahmeLabel = metadata.massnahme === 'austausch' ? 'Austausch' : 'Neueinbau'
    const masseLabel =
      metadata.massnahme === 'austausch'
        ? `${metadata.breite} × ${metadata.hoehe} cm`
        : `Rohbau: ${metadata.breite} × ${metadata.hoehe} cm`

    await resend.emails.send({
      from: 'SalesCraft <noreply@dachblick.de>',
      to: notifyEmail,
      subject: `Neuer Lead — ${customer.vorname} ${customer.nachname} (${customer.plz})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Neuer Lead eingegangen</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 8px; color: #6b7280; width: 140px;">Name</td><td style="padding: 8px; font-weight: 600;">${customer.vorname} ${customer.nachname}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280;">E-Mail</td><td style="padding: 8px;">${customer.email}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Telefon</td><td style="padding: 8px;">${customer.telefon}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280;">PLZ</td><td style="padding: 8px;">${customer.plz}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Maßnahme</td><td style="padding: 8px;">${massnahmeLabel}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280;">Anzahl Fenster</td><td style="padding: 8px;">${metadata.anzahl}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Maße</td><td style="padding: 8px;">${masseLabel}</td></tr>
            ${metadata.zubehoer?.length ? `<tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280;">Zubehör</td><td style="padding: 8px;">${metadata.zubehoer.join(', ')}</td></tr>` : ''}
            ${customer.anmerkungen ? `<tr><td style="padding: 8px; color: #6b7280;">Anmerkungen</td><td style="padding: 8px;">${customer.anmerkungen}</td></tr>` : ''}
          </table>
          <a href="${appUrl}/leads/${leadData.id}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Lead im CRM öffnen
          </a>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true, lead_id: leadData.id })
}
