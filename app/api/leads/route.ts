import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Verify the caller is authenticated
  const supabaseUser = createServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role to bypass RLS for the insert
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let body: {
    customer: { vorname: string; nachname: string; email: string; phone?: string; plz: string; city?: string }
    lead: {
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
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { customer, lead } = body

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
    user_id: user.id,
    type: 'status_aenderung',
    note: 'Lead manuell angelegt',
  })

  return NextResponse.json({ lead_id: leadData.id })
}
