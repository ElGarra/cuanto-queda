import * as React from 'react'

interface RSVPConfirmationProps {
  guestFirstName: string
  status: 'CONFIRMED' | 'DECLINED'
  partner1Name: string
  partner2Name: string
  weddingDate: string | null
  rsvpUrl: string
}

export function RSVPConfirmation({
  guestFirstName,
  status,
  partner1Name,
  partner2Name,
  weddingDate,
  rsvpUrl,
}: RSVPConfirmationProps) {
  const confirmed = status === 'CONFIRMED'

  return (
    <html>
      <head><meta charSet="utf-8" /></head>
      <body style={{ fontFamily: 'Georgia, serif', background: '#F5F0E8', margin: 0, padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', padding: '48px 40px', borderTop: '3px solid #C9A84C' }}>
          <p style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', margin: '0 0 32px' }}>
            {confirmed ? 'Confirmación recibida' : 'Respuesta registrada'}
          </p>

          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: 32, color: '#2C2C2C', margin: '0 0 24px', fontStyle: 'italic' }}>
            {confirmed ? '¡Nos vemos pronto!' : 'Gracias por avisarnos'}
          </h1>

          <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, fontFamily: 'Arial, sans-serif', margin: '0 0 16px' }}>
            Hola <strong>{guestFirstName}</strong>,
          </p>

          {confirmed ? (
            <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, fontFamily: 'Arial, sans-serif', margin: '0 0 24px' }}>
              ¡Tu asistencia a la boda de <strong>{partner1Name} &amp; {partner2Name}</strong> está confirmada!
              {weddingDate && ` Nos vemos el ${weddingDate}.`}
            </p>
          ) : (
            <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, fontFamily: 'Arial, sans-serif', margin: '0 0 24px' }}>
              Registramos que no vas a poder asistir a nuestra boda. Te vamos a extrañar.
            </p>
          )}

          <p style={{ color: '#7a7065', fontSize: 13, lineHeight: 1.8, fontFamily: 'Arial, sans-serif', margin: '0 0 24px' }}>
            Si necesitás cambiar tu respuesta, podés hacerlo en cualquier momento desde tu link personal:
          </p>

          <a href={rsvpUrl} style={{ color: '#C9A84C', fontSize: 13, fontFamily: 'Arial, sans-serif' }}>
            {rsvpUrl}
          </a>

          <div style={{ width: '100%', height: 1, background: '#F5F0E8', margin: '32px 0 24px' }} />

          <p style={{ color: '#C9A84C', fontSize: 13, fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: 0 }}>
            Con amor, {partner1Name} &amp; {partner2Name}
          </p>
        </div>
      </body>
    </html>
  )
}
