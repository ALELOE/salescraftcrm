export type UserRole = 'admin' | 'sales'

export type LeadStatus =
  | 'neu'
  | 'kontaktiert'
  | 'angebot_versendet'
  | 'termin_geplant'
  | 'angebot_aktualisiert'
  | 'gewonnen'
  | 'verloren'

export type ActivityType =
  | 'notiz'
  | 'anruf'
  | 'email'
  | 'status_aenderung'
  | 'angebot_erstellt'
  | 'angebot_versendet'
  | 'termin_vereinbart'

export type AppointmentType = 'aufmass' | 'montage'

export type QuoteStatus = 'entwurf' | 'versendet' | 'akzeptiert' | 'abgelehnt'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Customer {
  id: string
  vorname: string
  nachname: string
  email: string
  phone: string
  plz: string
  city: string
  created_at: string
}

export interface Lead {
  id: string
  customer_id: string
  assigned_to: string | null
  status: LeadStatus
  source: string | null
  massnahme: 'austausch' | 'neueinbau'
  anzahl_fenster: number
  typenschild: string | null
  fenster_breite_cm: number | null
  fenster_hoehe_cm: number | null
  rohbau_breite_cm: number | null
  rohbau_hoehe_cm: number | null
  dachneigung: string | null
  zubehoer: string[]
  anmerkungen: string | null
  created_at: string
  updated_at: string
}

export interface LeadWithCustomer extends Lead {
  customers: Customer
  assignedUser?: User | null
}

export interface QuoteLineItem {
  beschreibung: string
  menge: number
  einzelpreis: number
}

export interface Quote {
  id: string
  lead_id: string
  status: QuoteStatus
  line_items: QuoteLineItem[]
  total_amount: number
  valid_until: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  lead_id: string
  user_id: string | null
  type: ActivityType
  note: string
  created_at: string
}

export interface ActivityWithUser extends Activity {
  users?: User | null
}

export interface Appointment {
  id: string
  lead_id: string
  assigned_to: string | null
  type: AppointmentType
  scheduled_at: string
  duration_minutes: number
  location: string | null
  notes: string | null
  completed_at: string | null
  created_at: string
}

export interface AppointmentWithDetails extends Appointment {
  leads?: {
    customers: Customer
  } | null
  assignedUser?: User | null
}

export interface WebhookPayload {
  service_type: string
  metadata: {
    massnahme: 'austausch' | 'neueinbau'
    typenschild?: string
    breite: number
    hoehe: number
    dachneigung?: string
    anzahl: number
    zubehoer: string[]
  }
  customer: {
    vorname: string
    nachname: string
    email: string
    telefon: string
    plz: string
    anmerkungen?: string
  }
}
