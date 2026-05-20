'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Users, Calendar, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { href: '/leads', label: 'Leads', Icon: Users },
  { href: '/appointments', label: 'Termine', Icon: Calendar },
  { href: '/settings', label: 'Einstellungen', Icon: Settings },
]

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  sales: 'Vertrieb',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

interface SidebarProps {
  userName: string
  userEmail?: string
  userRole?: string
}

export default function Sidebar({ userName, userRole = 'sales' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Abgemeldet')
  }

  const userInitials = initials(userName)
  const displayRole = ROLE_LABELS[userRole] ?? userRole

  return (
    <aside style={{
      width: 240,
      background: '#fff',
      borderRight: '1px solid #ececec',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Brand */}
      <div style={{
        padding: '18px 20px 16px',
        borderBottom: '1px solid #ececec',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: '#0a0a0a', lineHeight: 1.2 }}>
          SalesCraft
        </div>
        <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, color: '#a3a3a3', letterSpacing: 0 }}>
          Dachblick CRM
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? '#0a0a0a' : '#525252',
                borderLeft: `2px solid ${active ? '#0a0a0a' : 'transparent'}`,
                background: active ? '#f5f5f5' : 'transparent',
                textDecoration: 'none',
                transition: 'background 150ms cubic-bezier(0.4,0,0.2,1), color 150ms cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = '#f5f5f5'
                  el.style.color = '#0a0a0a'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'transparent'
                  el.style.color = '#525252'
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid #ececec',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#ececec', color: '#525252',
            fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {userInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </div>
            <div style={{ fontSize: 12, color: '#a3a3a3', lineHeight: 1.2 }}>
              {displayRole}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Abmelden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#a3a3a3', padding: 4, borderRadius: 4,
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#0a0a0a' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#a3a3a3' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
