import * as React from 'react'

interface AdminNotificationProps {
  guestName: string
  status: 'CONFIRMED' | 'DECLINED'
  companions: { firstName: string; lastName: string; dietaryRestrictions?: string }[]
  dietaryRestrictions: string | null
  message: string | null
  changedAt: string
  rsvpAdminUrl: string
}

export function AdminNotification({
  guestName,
  status,
  companions,
  dietaryRestrictions,
  message,
  changedAt,
  rsvpAdminUrl,
}: AdminNotificationProps) {
  return (
    <html>
      <head><meta charSet="utf-8" /></head>
      <body style={{ fontFamily: 'Arial, sans-serif', background: '#f5f5f5', margin: 0, padding: '24px 16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', padding: '32px', borderLeft: '4px solid #C9A84C' }}>
          <p style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Nuevo RSVP
          </p>

          <h2 style={{ margin: '0 0 4px', fontSize: 20, color: '#2C2C2C' }}>{guestName}</h2>
          <p style={{ margin: '0 0 24px', fontSize: 16, color: status === 'CONFIRMED' ? '#2d7a2d' : '#c0392b', fontWeight: 'bold' }}>
            {status === 'CONFIRMED' ? '✓ Confirmado' : '✗ No asiste'}
          </p>

          {companions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 'bold', color: '#2C2C2C' }}>
                Acompañantes ({companions.length}):
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#7a7065', fontSize: 13 }}>
                {companions.map((c, i) => (
                  <li key={i}>{c.firstName} {c.lastName}{c.dietaryRestrictions ? ` — ${c.dietaryRestrictions}` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          {dietaryRestrictions && (
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#7a7065' }}>
              <strong>Restricciones alimentarias:</strong> {dietaryRestrictions}
            </p>
          )}

          {message && (
            <div style={{ background: '#F5F0E8', padding: '12px 16px', margin: '0 0 16px', borderRadius: 4 }}>
              <p style={{ margin: 0, fontSize: 13, fontStyle: 'italic', color: '#2C2C2C' }}>"{message}"</p>
            </div>
          )}

          <p style={{ margin: '0 0 24px', fontSize: 12, color: '#aaa' }}>{changedAt}</p>

          <a href={rsvpAdminUrl} style={{
            display: 'inline-block',
            background: '#2C2C2C',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 20px',
            fontSize: 12,
            letterSpacing: '0.1em',
          }}>
            Ver todos los RSVPs
          </a>
        </div>
      </body>
    </html>
  )
}
