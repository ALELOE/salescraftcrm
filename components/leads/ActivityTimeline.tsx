'use client'

import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { ActivityWithUser, ActivityType } from '@/lib/types'
import { PencilLine, Phone, Mail, ArrowRightLeft, FileText, Calendar } from 'lucide-react'

const ICONS: Record<ActivityType, React.ElementType> = {
  notiz: PencilLine,
  anruf: Phone,
  email: Mail,
  status_aenderung: ArrowRightLeft,
  angebot_erstellt: FileText,
  angebot_versendet: FileText,
  termin_vereinbart: Calendar,
}

const TYPE_LABELS: Record<ActivityType, string> = {
  notiz: 'Notiz',
  anruf: 'Anruf',
  email: 'E-Mail',
  status_aenderung: 'Status geändert',
  angebot_erstellt: 'Angebot erstellt',
  angebot_versendet: 'Angebot versendet',
  termin_vereinbart: 'Termin vereinbart',
}

interface ActivityTimelineProps {
  activities: ActivityWithUser[]
  loading?: boolean
}

export default function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div style={{ padding: '20px 0', color: '#a3a3a3', fontSize: 13 }}>Laden…</div>
    )
  }

  if (activities.length === 0) {
    return (
      <div style={{ padding: '20px 0', color: '#a3a3a3', fontSize: 13 }}>
        Noch keine Aktivität.
      </div>
    )
  }

  return (
    <div>
      {activities.map((activity, index) => {
        const IconComponent = ICONS[activity.type] ?? FileText
        const isLast = index === activities.length - 1

        return (
          <div key={activity.id} style={{ display: 'flex', gap: 12, paddingBottom: isLast ? 0 : 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#f5f5f5', border: '1px solid #ececec',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#525252',
              }}>
                <IconComponent size={13} />
              </div>
              {!isLast && (
                <div style={{ width: 1, flex: 1, background: '#ececec', marginTop: 4 }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#525252' }}>
                  {TYPE_LABELS[activity.type]}
                </span>
                <span style={{ fontSize: 12, color: '#a3a3a3', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: de })}
                </span>
              </div>
              {activity.note && (
                <p style={{ fontSize: 13, color: '#0a0a0a', marginTop: 3, lineHeight: 1.45 }}>
                  {activity.note}
                </p>
              )}
              {activity.users && (
                <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>{activity.users.name}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
