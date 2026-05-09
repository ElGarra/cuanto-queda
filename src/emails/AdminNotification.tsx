interface Companion { firstName: string; lastName: string; dietaryRestrictions?: string }

interface AdminNotificationProps {
  guestName: string
  status: 'CONFIRMED' | 'DECLINED'
  companions: Companion[]
  dietaryRestrictions: string | null
  message: string | null
  changedAt: string
  rsvpAdminUrl: string
}

export function renderAdminNotification(p: AdminNotificationProps): string {
  const companionsHtml = p.companions.length
    ? `<div style="margin-bottom:16px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#2C2C2C">Acompañantes (${p.companions.length}):</p>
        <ul style="margin:0;padding-left:20px;color:#7a7065;font-size:13px">
          ${p.companions.map((c) => `<li>${c.firstName} ${c.lastName}${c.dietaryRestrictions ? ` — ${c.dietaryRestrictions}` : ''}</li>`).join('')}
        </ul>
      </div>`
    : ''

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:24px 16px">
<div style="max-width:520px;margin:0 auto;background:#fff;padding:32px;border-left:4px solid #C9A84C">
  <p style="color:#C9A84C;font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin:0 0 16px">Nuevo RSVP</p>
  <h2 style="margin:0 0 4px;font-size:20px;color:#2C2C2C">${p.guestName}</h2>
  <p style="margin:0 0 24px;font-size:16px;color:${p.status === 'CONFIRMED' ? '#2d7a2d' : '#c0392b'};font-weight:bold">${p.status === 'CONFIRMED' ? '✓ Confirmado' : '✗ No asiste'}</p>
  ${companionsHtml}
  ${p.dietaryRestrictions ? `<p style="margin:0 0 12px;font-size:13px;color:#7a7065"><strong>Restricciones:</strong> ${p.dietaryRestrictions}</p>` : ''}
  ${p.message ? `<div style="background:#F5F0E8;padding:12px 16px;margin:0 0 16px;border-radius:4px"><p style="margin:0;font-size:13px;font-style:italic;color:#2C2C2C">"${p.message}"</p></div>` : ''}
  <p style="margin:0 0 24px;font-size:12px;color:#aaa">${p.changedAt}</p>
  <a href="${p.rsvpAdminUrl}" style="display:inline-block;background:#2C2C2C;color:#fff;text-decoration:none;padding:10px 20px;font-size:12px;letter-spacing:.1em">Ver todos los RSVPs</a>
</div></body></html>`
}
