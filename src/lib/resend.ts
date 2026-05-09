import { Resend } from 'resend'

// Lazily initialized so the build doesn't fail when env vars are absent
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(key)
  }
  return _resend
}

// Use onboarding@resend.dev until a domain is verified in Resend dashboard
export const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
