'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

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
      toast.success('Termin abgeschlossen')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      style={{
        fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
        background: 'transparent', color: '#0a0a0a',
        border: '1px solid #ececec', borderRadius: 4,
        padding: '5px 10px', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 5,
        opacity: loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <Check size={13} />
      Abschließen
    </button>
  )
}
