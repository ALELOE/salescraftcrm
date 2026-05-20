import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  const userName = profile?.name ?? user.email?.split('@')[0] ?? 'Nutzer'
  const userEmail = profile?.email ?? user.email ?? ''
  const userRole = profile?.role ?? 'sales'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <Sidebar userName={userName} userEmail={userEmail} userRole={userRole} />
      <main style={{ minWidth: 0, background: 'var(--sc-bg)' }}>
        {children}
      </main>
    </div>
  )
}
