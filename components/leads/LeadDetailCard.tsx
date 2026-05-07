import { LeadWithCustomer } from '@/lib/types'
import { MASSNAHME_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface LeadDetailCardProps {
  lead: LeadWithCustomer
}

export default function LeadDetailCard({ lead }: LeadDetailCardProps) {
  const { customers } = lead

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kundendaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Name</span>
            <p className="font-medium">{customers.vorname} {customers.nachname}</p>
          </div>
          <div>
            <span className="text-gray-500">E-Mail</span>
            <p>
              <a href={`mailto:${customers.email}`} className="text-blue-600 hover:underline">
                {customers.email}
              </a>
            </p>
          </div>
          <div>
            <span className="text-gray-500">Telefon</span>
            <p>
              <a href={`tel:${customers.phone}`} className="text-blue-600 hover:underline">
                {customers.phone}
              </a>
            </p>
          </div>
          <div>
            <span className="text-gray-500">PLZ / Stadt</span>
            <p>{customers.plz} {customers.city}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fenster Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Maßnahme</span>
            <Badge variant="outline">
              {MASSNAHME_LABELS[lead.massnahme]}
            </Badge>
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

          <div>
            <span className="text-gray-500">Zubehör</span>
            {lead.zubehoer && lead.zubehoer.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {lead.zubehoer.map((item, i) => (
                  <li key={i} className="text-gray-700">• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Kein Zubehör</p>
            )}
          </div>

          {lead.anmerkungen && (
            <div>
              <span className="text-gray-500">Anmerkungen</span>
              <p className="text-gray-700 mt-1">{lead.anmerkungen}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lead Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {lead.source && (
            <div>
              <span className="text-gray-500">Quelle</span>
              <p>{lead.source}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Erstellt am</span>
            <p>{format(new Date(lead.created_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr</p>
          </div>
          <div>
            <span className="text-gray-500">Zuletzt geändert</span>
            <p>{format(new Date(lead.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
