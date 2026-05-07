import { LeadStatus, ActivityType } from './types'

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'neu', label: 'Neu' },
  { value: 'kontaktiert', label: 'Kontaktiert' },
  { value: 'angebot_versendet', label: 'Angebot versendet' },
  { value: 'termin_geplant', label: 'Termin geplant' },
  { value: 'angebot_aktualisiert', label: 'Angebot aktualisiert' },
  { value: 'gewonnen', label: 'Gewonnen' },
  { value: 'verloren', label: 'Verloren' },
]

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  neu: 'bg-blue-100 text-blue-800 border-blue-200',
  kontaktiert: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  angebot_versendet: 'bg-orange-100 text-orange-800 border-orange-200',
  termin_geplant: 'bg-purple-100 text-purple-800 border-purple-200',
  angebot_aktualisiert: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  gewonnen: 'bg-green-100 text-green-800 border-green-200',
  verloren: 'bg-red-100 text-red-800 border-red-200',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  neu: 'Neu',
  kontaktiert: 'Kontaktiert',
  angebot_versendet: 'Angebot versendet',
  termin_geplant: 'Termin geplant',
  angebot_aktualisiert: 'Angebot aktualisiert',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
}

export const PIPELINE_STEPS: LeadStatus[] = [
  'neu',
  'kontaktiert',
  'angebot_versendet',
  'termin_geplant',
  'angebot_aktualisiert',
  'gewonnen',
]

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  notiz: 'Notiz',
  anruf: 'Anruf',
  email: 'E-Mail',
  status_aenderung: 'Status geändert',
  angebot_erstellt: 'Angebot erstellt',
  angebot_versendet: 'Angebot versendet',
  termin_vereinbart: 'Termin vereinbart',
}

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  notiz: '📝',
  anruf: '📞',
  email: '📧',
  status_aenderung: '🔄',
  angebot_erstellt: '📄',
  angebot_versendet: '📬',
  termin_vereinbart: '📅',
}

export const MASSNAHME_LABELS = {
  austausch: 'Austausch',
  neueinbau: 'Neueinbau',
} as const

export const APPOINTMENT_TYPE_LABELS = {
  aufmass: 'Aufmaß',
  montage: 'Montage',
} as const
