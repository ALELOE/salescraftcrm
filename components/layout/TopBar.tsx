interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopBarProps {
  title: string
  subtitle?: string
  crumb?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, crumb, actions }: TopBarProps) {
  const items: BreadcrumbItem[] = crumb ?? [{ label: title }]

  return (
    <header style={{
      height: 48,
      background: '#fff',
      borderBottom: '1px solid #ececec',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isLast ? (
                <span style={{ color: '#0a0a0a', fontWeight: 500 }}>{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  style={{ color: '#a3a3a3', textDecoration: 'none' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#a3a3a3'; (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}
                >
                  {item.label}
                </a>
              )}
              {!isLast && <span style={{ color: '#a3a3a3' }}>/</span>}
            </span>
          )
        })}
        {subtitle && (
          <span style={{ color: '#a3a3a3', marginLeft: 4 }}>· {subtitle}</span>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </header>
  )
}
