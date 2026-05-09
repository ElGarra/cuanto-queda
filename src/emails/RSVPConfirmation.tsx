interface RSVPConfirmationProps {
  guestFirstName: string
  status: 'CONFIRMED' | 'DECLINED'
  partner1Name: string
  partner2Name: string
  weddingDate: string | null
  rsvpUrl: string
}

export function renderRSVPConfirmation(p: RSVPConfirmationProps): string {
  const confirmed = p.status === 'CONFIRMED'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;background:#F5F0E8;margin:0;padding:40px 20px">
<div style="max-width:520px;margin:0 auto;background:#fff;padding:48px 40px;border-top:3px solid #C9A84C">
  <p style="color:#C9A84C;font-size:11px;letter-spacing:.3em;text-transform:uppercase;font-family:Arial,sans-serif;margin:0 0 32px">${confirmed ? 'Confirmación recibida' : 'Respuesta registrada'}</p>
  <h1 style="font-family:Georgia,serif;font-weight:300;font-size:32px;color:#2C2C2C;margin:0 0 24px;font-style:italic">${confirmed ? '¡Nos vemos pronto!' : 'Gracias por avisarnos'}</h1>
  <p style="color:#7a7065;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;margin:0 0 16px">Hola <strong>${p.guestFirstName}</strong>,</p>
  <p style="color:#7a7065;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;margin:0 0 24px">
    ${confirmed
      ? `¡Tu asistencia a la boda de <strong>${p.partner1Name} &amp; ${p.partner2Name}</strong> está confirmada!${p.weddingDate ? ` Nos vemos el ${p.weddingDate}.` : ''}`
      : `Registramos que no vas a poder asistir a nuestra boda. Te vamos a extrañar.`}
  </p>
  <p style="color:#7a7065;font-size:13px;line-height:1.8;font-family:Arial,sans-serif;margin:0 0 24px">Si necesitás cambiar tu respuesta, podés hacerlo desde tu link personal:</p>
  <a href="${p.rsvpUrl}" style="color:#C9A84C;font-size:13px;font-family:Arial,sans-serif">${p.rsvpUrl}</a>
  <div style="border-top:1px solid #F5F0E8;margin-top:32px;padding-top:24px">
    <p style="color:#C9A84C;font-size:13px;font-style:italic;font-family:Georgia,serif;margin:0">Con amor, ${p.partner1Name} &amp; ${p.partner2Name}</p>
  </div>
</div></body></html>`
}
