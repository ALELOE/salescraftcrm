'use client'

import { useMemo } from 'react'

interface DashboardGreetingProps {
  firstName: string
  openLeadsCount: number
}

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

function germanDate() {
  return new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DashboardGreeting({ firstName, openLeadsCount }: DashboardGreetingProps) {
  const greet = useMemo(() => greeting(), [])
  const date = useMemo(() => germanDate(), [])

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#0a0a0a' }}>
        {greet}, {firstName}.
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: '#a3a3a3' }}>
        {date}
        {openLeadsCount > 0 && (
          <> · <span style={{ color: '#0a0a0a' }}>{openLeadsCount} Lead{openLeadsCount !== 1 ? 's' : ''} benötigen Ihre Aufmerksamkeit</span></>
        )}
      </div>
    </div>
  )
}
