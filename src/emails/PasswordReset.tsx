interface PasswordResetProps {
  name: string | null
  resetUrl: string
  expiresInMinutes: number
}

export function renderPasswordReset(p: PasswordResetProps): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;background:#F5F0E8;margin:0;padding:40px 20px">
<div style="max-width:520px;margin:0 auto;background:#fff;padding:48px 40px;border-top:3px solid #C9A84C">
  <p style="color:#C9A84C;font-size:11px;letter-spacing:.3em;text-transform:uppercase;font-family:Arial,sans-serif;margin:0 0 32px">Seguridad de cuenta</p>
  <h1 style="font-family:Georgia,serif;font-weight:300;font-size:28px;color:#2C2C2C;margin:0 0 24px">Restablecer contraseña</h1>
  <p style="color:#7a7065;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;margin:0 0 24px">Hola${p.name ? ` ${p.name}` : ''},</p>
  <p style="color:#7a7065;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;margin:0 0 32px">
    Recibimos una solicitud para restablecer tu contraseña. Este link expira en <strong>${p.expiresInMinutes} minutos</strong>.
  </p>
  <a href="${p.resetUrl}" style="display:inline-block;background:#C9A84C;color:#fff;text-decoration:none;padding:14px 32px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Restablecer contraseña</a>
  <p style="color:#7a7065;font-size:12px;margin-top:32px;font-family:Arial,sans-serif">Si no solicitaste esto, ignorá este email.</p>
  <div style="border-top:1px solid #F5F0E8;margin-top:32px;padding-top:24px">
    <p style="color:#aaa;font-size:11px;font-family:Arial,sans-serif;margin:0">${p.resetUrl}</p>
  </div>
</div></body></html>`
}
