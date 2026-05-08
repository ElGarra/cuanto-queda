import * as React from 'react'

interface GuestInviteProps {
  guestFirstName: string
  partner1Name: string
  partner2Name: string
  weddingDate: string | null
  venueName: string | null
  rsvpUrl: string
}

export function GuestInvite({
  guestFirstName,
  partner1Name,
  partner2Name,
  weddingDate,
  venueName,
  rsvpUrl,
}: GuestInviteProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body style={{ fontFamily: 'Georgia, serif', background: '#F5F0E8', margin: 0, padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', padding: '48px 40px', borderTop: '3px solid #C9A84C' }}>
          <p style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', margin: '0 0 32px' }}>
            Invitación de boda
          </p>

          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: 36, color: '#2C2C2C', margin: '0 0 8px', fontStyle: 'italic' }}>
            {partner1Name} &amp; {partner2Name}
          </h1>

          <div style={{ width: 40, height: 1, background: '#C9A84C', margin: '16px 0 24px' }} />

          <p style={{ color: '#2C2C2C', fontSize: 16, lineHeight: 1.7, margin: '0 0 24px', fontFamily: 'Arial, sans-serif' }}>
            Querido/a <strong>{guestFirstName}</strong>,
          </p>

          <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, margin: '0 0 24px', fontFamily: 'Arial, sans-serif' }}>
            Con mucha alegría te invitamos a celebrar nuestra boda.
            {weddingDate && ` Nos casamos el ${weddingDate}.`}
            {venueName && ` La celebración será en ${venueName}.`}
          </p>

          <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, margin: '0 0 32px', fontFamily: 'Arial, sans-serif' }}>
            Por favor confirmá tu asistencia haciendo click en el botón de abajo.
          </p>

          <a href={rsvpUrl} style={{
            display: 'inline-block',
            background: '#C9A84C',
            color: '#fff',
            textDecoration: 'none',
            padding: '14px 32px',
            fontSize: 13,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
          }}>
            Confirmar asistencia
          </a>

          <p style={{ color: '#7a7065', fontSize: 12, marginTop: 32, fontFamily: 'Arial, sans-serif' }}>
            O copiá este link en tu navegador:<br />
            <span style={{ color: '#C9A84C' }}>{rsvpUrl}</span>
          </p>

          <div style={{ width: '100%', height: 1, background: '#F5F0E8', margin: '32px 0 24px' }} />

          <p style={{ color: '#C9A84C', fontSize: 13, fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: 0 }}>
            Con amor, {partner1Name} &amp; {partner2Name}
          </p>
        </div>
      </body>
    </html>
  )
}
