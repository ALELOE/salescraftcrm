import { LeadWithCustomer } from '@/lib/types'
import { MASSNAHME_LABELS } from '@/lib/constants'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface LeadDetailCardProps {
  lead: LeadWithCustomer
}

const SECTION_HEADER: React.CSSProperties = {
  padding: '14px 20px',
  borderBottom: '1px solid #ececec',
  fontSize: 14,
  fontWeight: 500,
  color: '#525252',
}

const CARD: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #ececec',
  borderRadius: 6,
}

const ROW: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '10px 20px',
  borderBottom: '1px solid #ececec',
}

const LABEL: React.CSSProperties = {
  fontSize: 12,
  color: '#a3a3a3',
  fontWeight: 400,
}

const VALUE: React.CSSProperties = {
  fontSize: 13,
  color: '#0a0a0a',
}

export default function LeadDetailCard({ lead }: LeadDetailCardProps) {
  const { customers } = lead

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Kundendaten */}
      <div style={CARD}>
        <div style={SECTION_HEADER}>Kundendaten</div>
        <div>
          <div style={ROW}>
            <span style={LABEL}>Name</span>
            <span style={{ ...VALUE, fontWeight: 500 }}>{customers.vorname} {customers.nachname}</span>
          </div>
          <div style={ROW}>
            <span style={LABEL}>E-Mail</span>
            <a href={`mailto:${customers.email}`} style={{ ...VALUE, color: '#0a0a0a', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}>
              {customers.email}
            </a>
          </div>
          <div style={ROW}>
            <span style={LABEL}>Telefon</span>
            <a href={`tel:${customers.phone}`} style={{ ...VALUE, color: '#0a0a0a', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}>
              {customers.phone}
            </a>
          </div>
          <div style={{ ...ROW, borderBottom: 'none' }}>
            <span style={LABEL}>PLZ / Stadt</span>
            <span style={VALUE}>{customers.plz} {customers.city}</span>
          </div>
        </div>
      </div>

      {/* Fenster Details */}
      <div style={CARD}>
        <div style={SECTION_HEADER}>Fenster Details</div>
        <div>
          <div style={ROW}>
            <span style={LABEL}>Maßnahme</span>
            <span style={VALUE}>{MASSNAHME_LABELS[lead.massnahme]}</span>
          </div>
          <div style={ROW}>
            <span style={LABEL}>Anzahl Fenster</span>
            <span style={{ ...VALUE, fontWeight: 500 }}>{lead.anzahl_fenster}</span>
          </div>

          {lead.massnahme === 'austausch' && (
            <>
              {lead.typenschild && (
                <div style={ROW}>
                  <span style={LABEL}>Typenschild</span>
                  <span style={VALUE}>{lead.typenschild}</span>
                </div>
              )}
              {(lead.fenster_breite_cm || lead.fenster_hoehe_cm) && (
                <div style={ROW}>
                  <span style={LABEL}>Maße (B × H)</span>
                  <span style={VALUE}>{lead.fenster_breite_cm} × {lead.fenster_hoehe_cm} cm</span>
                </div>
              )}
            </>
          )}

          {lead.massnahme === 'neueinbau' && (
            <>
              {(lead.rohbau_breite_cm || lead.rohbau_hoehe_cm) && (
                <div style={ROW}>
                  <span style={LABEL}>Rohbaumaß (B × H)</span>
                  <span style={VALUE}>{lead.rohbau_breite_cm} × {lead.rohbau_hoehe_cm} cm</span>
                </div>
              )}
              {lead.dachneigung && (
                <div style={ROW}>
                  <span style={LABEL}>Dachneigung</span>
                  <span style={VALUE}>{lead.dachneigung}</span>
                </div>
              )}
            </>
          )}

          <div style={ROW}>
            <span style={LABEL}>Zubehör</span>
            {lead.zubehoer && lead.zubehoer.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {lead.zubehoer.map((item, i) => (
                  <span key={i} style={VALUE}>{item}</span>
                ))}
              </div>
            ) : (
              <span style={{ ...VALUE, color: '#a3a3a3' }}>Kein Zubehör</span>
            )}
          </div>

          {lead.anmerkungen && (
            <div style={ROW}>
              <span style={LABEL}>Anmerkungen</span>
              <span style={{ ...VALUE, lineHeight: 1.5 }}>{lead.anmerkungen}</span>
            </div>
          )}

          {!lead.anmerkungen && !lead.zubehoer?.length && !lead.typenschild && (
            <div style={{ height: 4 }} />
          )}
        </div>
      </div>

      {/* Lead Info */}
      <div style={CARD}>
        <div style={SECTION_HEADER}>Lead Info</div>
        <div>
          {lead.source && (
            <div style={ROW}>
              <span style={LABEL}>Quelle</span>
              <span style={VALUE}>{lead.source}</span>
            </div>
          )}
          <div style={ROW}>
            <span style={LABEL}>Erstellt am</span>
            <span style={VALUE}>{format(new Date(lead.created_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr</span>
          </div>
          <div style={{ ...ROW, borderBottom: 'none' }}>
            <span style={LABEL}>Zuletzt geändert</span>
            <span style={VALUE}>{format(new Date(lead.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr</span>
          </div>
        </div>
      </div>
    </div>
  )
}
