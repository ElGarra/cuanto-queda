interface GuestInviteProps {
  guestFirstName: string
  partner1Name: string
  partner2Name: string
  weddingDate: string | null
  venueName: string | null
  rsvpUrl: string
}

export function renderGuestInvite(p: GuestInviteProps): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;background:#F5F0E8;margin:0;padding:40px 20px">
<div style="max-width:520px;margin:0 auto;background:#fff;padding:48px 40px;border-top:3px solid #C9A84C">
  <p style="color:#C9A84C;font-size:11px;letter-spacing:.3em;text-transform:uppercase;font-family:Arial,sans-serif;margin:0 0 32px">Invitación de boda</p>
  <h1 style="font-family:Georgia,serif;font-weight:300;font-size:36px;color:#2C2C2C;margin:0 0 8px;font-style:italic">${p.partner1Name} &amp; ${p.partner2Name}</h1>
  <div style="width:40px;height:1px;background:#C9A84C;margin:16px 0 24px"></div>
  <p style="color:#2C2C2C;font-size:16px;line-height:1.7;margin:0 0 24px;font-family:Arial,sans-serif">Querido/a <strong>${p.guestFirstName}</strong>,</p>
  <p style="color:#7a7065;font-size:15px;line-height:1.8;margin:0 0 24px;font-family:Arial,sans-serif">
    Con mucha alegría te invitamos a celebrar nuestra boda.${p.weddingDate ? ` Nos casamos el ${p.weddingDate}.` : ''}${p.venueName ? ` La celebración será en ${p.venueName}.` : ''}
  </p>
  <p style="color:#7a7065;font-size:15px;line-height:1.8;margin:0 0 32px;font-family:Arial,sans-serif">Por favor confirmá tu asistencia haciendo click en el botón de abajo.</p>
  <a href="${p.rsvpUrl}" style="display:inline-block;background:#C9A84C;color:#fff;text-decoration:none;padding:14px 32px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Confirmar asistencia</a>
  <p style="color:#7a7065;font-size:12px;margin-top:32px;font-family:Arial,sans-serif">O copiá este link:<br/><span style="color:#C9A84C">${p.rsvpUrl}</span></p>
  <div style="border-top:1px solid #F5F0E8;margin-top:32px;padding-top:24px">
    <p style="color:#C9A84C;font-size:13px;font-style:italic;font-family:Georgia,serif;margin:0">Con amor, ${p.partner1Name} &amp; ${p.partner2Name}</p>
  </div>
</div></body></html>`
}
