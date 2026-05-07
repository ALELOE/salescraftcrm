'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function MarkCompleteButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('appointments')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', appointmentId)

    if (error) {
      toast.error('Fehler beim Aktualisieren')
    } else {
      toast.success('Termin als abgeschlossen markiert')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button size="sm" variant="outline" onClick={handleComplete} disabled={loading}>
      <CheckCircle className="h-3.5 w-3.5 mr-1" />
      Abgeschlossen
    </Button>
  )
}
