'use client'

import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { ActivityWithUser } from '@/lib/types'
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_LABELS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'

interface ActivityTimelineProps {
  activities: ActivityWithUser[]
  loading?: boolean
}

export default function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Noch keine Aktivitäten
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
              {ACTIVITY_TYPE_ICONS[activity.type]}
            </div>
            {index < activities.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            )}
          </div>
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-700">
                {ACTIVITY_TYPE_LABELS[activity.type]}
              </span>
              <span className="text-xs text-gray-400 shrink-0">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </span>
            </div>
            {activity.note && (
              <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
            )}
            {activity.users && (
              <p className="text-xs text-gray-400 mt-1">{activity.users.name}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
