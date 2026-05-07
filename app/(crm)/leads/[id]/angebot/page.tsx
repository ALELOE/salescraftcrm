import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LeadWithCustomer, Quote } from '@/lib/types'
import QuoteEditor from '@/components/quotes/QuoteEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { MASSNAHME_LABELS } from '@/lib/constants'

export default async function AngebotPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [leadRes, quoteRes] = await Promise.all([
    supabase.from('leads').select('*, customers(*)').eq('id', params.id).single(),
    supabase.from('quotes').select('*').eq('lead_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (!leadRes.data) notFound()

  const lead = leadRes.data as LeadWithCustomer
  const existingQuote = quoteRes.data as Quote | null

  return (
    <div>
      <div className="bg-white border-b px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/leads/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück zum Lead
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Angebot erstellen</h1>
            <p className="text-sm text-gray-500">
              {lead.customers.vorname} {lead.customers.nachname}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quote Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Positionen</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteEditor
                  leadId={params.id}
                  lead={lead}
                  userId={user.id}
                  existingQuote={existingQuote}
                />
              </CardContent>
            </Card>
          </div>

          {/* Reference Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referenz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Maßnahme</span>
                  <div className="mt-1">
                    <Badge variant="outline">{MASSNAHME_LABELS[lead.massnahme]}</Badge>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Anzahl Fenster</span>
                  <p className="font-medium">{lead.anzahl_fenster}</p>
                </div>

                {lead.massnahme === 'austausch' && (
                  <>
                    {lead.typenschild && (
                      <div>
                        <span className="text-gray-500">Typenschild</span>
                        <p>{lead.typenschild}</p>
                      </div>
                    )}
                    {(lead.fenster_breite_cm || lead.fenster_hoehe_cm) && (
                      <div>
                        <span className="text-gray-500">Maße (B × H)</span>
                        <p>{lead.fenster_breite_cm} × {lead.fenster_hoehe_cm} cm</p>
                      </div>
                    )}
                  </>
                )}

                {lead.massnahme === 'neueinbau' && (
                  <>
                    {(lead.rohbau_breite_cm || lead.rohbau_hoehe_cm) && (
                      <div>
                        <span className="text-gray-500">Rohbaumaß (B × H)</span>
                        <p>{lead.rohbau_breite_cm} × {lead.rohbau_hoehe_cm} cm</p>
                      </div>
                    )}
                    {lead.dachneigung && (
                      <div>
                        <span className="text-gray-500">Dachneigung</span>
                        <p>{lead.dachneigung}</p>
                      </div>
                    )}
                  </>
                )}

                {lead.zubehoer && lead.zubehoer.length > 0 && (
                  <div>
                    <span className="text-gray-500">Zubehör</span>
                    <ul className="mt-1 space-y-1">
                      {lead.zubehoer.map((item, i) => (
                        <li key={i} className="text-gray-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="text-gray-500">Kunde</span>
                  <p className="font-medium">{lead.customers.vorname} {lead.customers.nachname}</p>
                  <p className="text-gray-600">{lead.customers.email}</p>
                  <p className="text-gray-600">{lead.customers.phone}</p>
                  <p className="text-gray-600">{lead.customers.plz} {lead.customers.city}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
