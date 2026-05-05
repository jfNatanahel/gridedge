import React from 'react'

export default function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#330000', color: '#FFB4B4', padding: 10, borderRadius: 6 }}>
      {children}
    </div>
  )
}
