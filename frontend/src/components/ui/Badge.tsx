import React from 'react'

export default function Badge({ children, color = '#111827' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ background: color, color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>{children}</span>
  )
}
