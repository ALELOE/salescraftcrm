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
    .select('name, email')
    .eq('id', user.id)
    .single()

  const userName = profile?.name ?? user.email?.split('@')[0] ?? 'Nutzer'
  const userEmail = profile?.email ?? user.email ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}
