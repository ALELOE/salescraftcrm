import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let raw: Record<string, unknown>
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Support both payload shapes:
  // Shape A (internal form): { customer: {...}, lead: {...} }
  // Shape B (external/webhook): { service_type, metadata: {...}, customer: {...} }
  let customer: {
    vorname: string; nachname: string; email: string
    phone?: string; plz: string; city?: string; anmerkungen?: string
  }
  let lead: {
    massnahme: 'austausch' | 'neueinbau'
    anzahl_fenster: number
    source: string
    assigned_to?: string | null
    typenschild?: string | null
    fenster_breite_cm?: number | null
    fenster_hoehe_cm?: number | null
    rohbau_breite_cm?: number | null
    rohbau_hoehe_cm?: number | null
    dachneigung?: string | null
    zubehoer: string[]
    anmerkungen?: string | null
  }

  if (raw.metadata) {
    // Shape B
    const c = raw.customer as Record<string, unknown>
    const m = raw.metadata as Record<string, unknown>
    customer = {
      vorname: c.vorname as string,
      nachname: c.nachname as string,
      email: c.email as string,
      phone: (c.telefon ?? c.phone ?? null) as string | undefined,
      plz: c.plz as string,
      city: (c.city ?? c.stadt ?? '') as string,
    }
    lead = {
      massnahme: m.massnahme as 'austausch' | 'neueinbau',
      anzahl_fenster: Number(m.anzahl ?? m.anzahl_fenster ?? 1),
      source: 'landingpage',
      typenschild: (m.typenschild ?? null) as string | null,
      fenster_breite_cm: m.breite != null ? Number(m.breite) : (m.fenster_breite_cm != null ? Number(m.fenster_breite_cm) : null),
      fenster_hoehe_cm: m.hoehe != null ? Number(m.hoehe) : (m.fenster_hoehe_cm != null ? Number(m.fenster_hoehe_cm) : null),
      rohbau_breite_cm: m.rohbau_breite_cm != null ? Number(m.rohbau_breite_cm) : null,
      rohbau_hoehe_cm: m.rohbau_hoehe_cm != null ? Number(m.rohbau_hoehe_cm) : null,
      dachneigung: (m.dachneigung ?? null) as string | null,
      zubehoer: (m.zubehoer ?? []) as string[],
      anmerkungen: (c.anmerkungen ?? m.anmerkungen ?? null) as string | null,
    }
  } else {
    // Shape A
    const body = raw as {
      customer: typeof customer
      lead: typeof lead
    }
    customer = body.customer
    lead = { ...body.lead, source: body.lead.source ?? 'manuell' }
  }

  // 1. Create customer
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .insert({
      vorname: customer.vorname,
      nachname: customer.nachname,
      email: customer.email,
      phone: customer.phone || null,
      plz: customer.plz,
      city: customer.city || '',
    })
    .select()
    .single()

  if (customerError) {
    console.error('Customer insert error:', customerError)
    return NextResponse.json({ error: 'Fehler beim Anlegen des Kunden', detail: customerError.message }, { status: 500 })
  }

  // 2. Create lead
  const { data: leadData, error: leadError } = await supabase
    .from('leads')
    .insert({
      customer_id: customerData.id,
      status: 'neu',
      source: lead.source,
      massnahme: lead.massnahme,
      anzahl_fenster: lead.anzahl_fenster,
      assigned_to: lead.assigned_to || null,
      typenschild: lead.typenschild ?? null,
      fenster_breite_cm: lead.fenster_breite_cm ?? null,
      fenster_hoehe_cm: lead.fenster_hoehe_cm ?? null,
      rohbau_breite_cm: lead.rohbau_breite_cm ?? null,
      rohbau_hoehe_cm: lead.rohbau_hoehe_cm ?? null,
      dachneigung: lead.dachneigung ?? null,
      zubehoer: lead.zubehoer ?? [],
      anmerkungen: lead.anmerkungen || null,
    })
    .select()
    .single()

  if (leadError) {
    console.error('Lead insert error:', leadError)
    return NextResponse.json({ error: 'Fehler beim Anlegen des Leads', detail: leadError.message }, { status: 500 })
  }

  // 3. Log activity
  await supabase.from('activities').insert({
    lead_id: leadData.id,
    user_id: null,
    type: 'status_aenderung',
    note: 'Lead angelegt',
  })

  return NextResponse.json({ lead_id: leadData.id })
}
