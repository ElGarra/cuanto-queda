'use client'

import { useState } from 'react'

export function RSVPSection() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/guests/resend-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <section className="bg-cream px-6 py-20 text-center">
      <p className="font-light text-[0.72rem] tracking-[0.35em] uppercase text-gold mb-4">
        Asistencia
      </p>
      <h2 className="font-serif font-light italic text-text-base mb-4"
        style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}>
        ¿Recibiste tu invitación?
      </h2>
      <p className="text-text-muted text-sm max-w-md mx-auto mb-10 leading-relaxed">
        Cada invitado recibe un link personal por email para confirmar su asistencia y ver la lista de regalos. Si ya lo tenés, usalo directamente.
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 max-w-xs mx-auto mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/40" />
        <span className="text-gold/50 text-xs tracking-widest">·</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/40" />
      </div>

      <p className="text-text-muted text-[0.75rem] tracking-[0.1em] uppercase mb-5">
        ¿Perdiste tu link?
      </p>

      {sent ? (
        <p className="text-text-muted text-sm italic font-serif text-lg">
          Si tu email está en la lista de invitados, te lo reenviamos en unos instantes.
        </p>
      ) : (
        <form onSubmit={handleResend}
          className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border border-gold/30 px-4 py-2.5 text-sm focus:outline-none focus:border-gold bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-white px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap">
            {loading ? 'Enviando...' : 'Reenviar link'}
          </button>
        </form>
      )}
    </section>
  )
}
