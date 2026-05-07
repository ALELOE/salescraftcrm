import { Badge } from '@/components/ui/badge'
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '@/lib/constants'
import { LeadStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export default function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(LEAD_STATUS_COLORS[status], className)}
    >
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  )
}
