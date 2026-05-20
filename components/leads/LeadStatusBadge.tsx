import { LeadStatus } from '@/lib/types'

const STATUS_CONFIG: Record<LeadStatus, { color: string; label: string }> = {
  neu:                  { color: '#3b82f6', label: 'Neu' },
  kontaktiert:          { color: '#eab308', label: 'Kontaktiert' },
  angebot_versendet:    { color: '#f97316', label: 'Angebot versendet' },
  termin_geplant:       { color: '#a855f7', label: 'Termin geplant' },
  angebot_aktualisiert: { color: '#6366f1', label: 'Angebot aktualisiert' },
  gewonnen:             { color: '#16a34a', label: 'Gewonnen' },
  verloren:             { color: '#dc2626', label: 'Verloren' },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  size?: number
}

export default function LeadStatusBadge({ status, size = 8 }: LeadStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { color: '#a3a3a3', label: status }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: cfg.color,
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 13, color: '#0a0a0a' }}>{cfg.label}</span>
    </span>
  )
}

export { STATUS_CONFIG }
