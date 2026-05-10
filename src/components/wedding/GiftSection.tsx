'use client'

import { useState } from 'react'

interface Gift {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  price: number | null
  currency: string
  totalReservations: number
}

interface Props {
  gifts: Gift[]
}

export function GiftSection({ gifts }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  if (gifts.length === 0) return null

  return (
    <section id="regalos" className="bg-white px-6 py-20 text-center">
      <p className="font-light text-[0.72rem] tracking-[0.35em] uppercase text-gold mb-4">
        Lista de regalos
      </p>
      <h2 className="font-serif font-light italic text-text-base mb-4"
        style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}>
        Para los que quieran participar
      </h2>
      <p className="text-text-muted text-sm max-w-md mx-auto mb-12 leading-relaxed">
        Si quieres hacernos un regalo, aquí encontrarás algunas ideas. Para reservar uno, usa tu link personal de invitado.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {gifts.map((gift) => (
          <div key={gift.id} className="border border-gold/15 text-left group hover:border-gold/40 transition-colors">
            {gift.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gift.imageUrl} alt={gift.title}
                className="w-full h-44 object-cover" />
            )}
            <div className="p-5">
              <h3 className="font-serif italic text-text-base text-lg mb-1">{gift.title}</h3>
              {gift.description && (
                <p className="text-text-muted text-xs leading-relaxed mb-3">{gift.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                {gift.price ? (
                  <span className="text-gold text-sm font-light">
                    {gift.price.toLocaleString('es-CL')} {gift.currency}
                  </span>
                ) : <span />}
                <div className="relative">
                  <button
                    onMouseEnter={() => setTooltip(gift.id)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => setTooltip(tooltip === gift.id ? null : gift.id)}
                    className="text-[0.65rem] tracking-[0.15em] uppercase border border-gold/40 text-gold px-3 py-1.5 hover:bg-gold hover:text-white transition-colors">
                    Reservar
                  </button>
                  {tooltip === gift.id && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-text-base text-white text-xs p-3 leading-relaxed z-10">
                      Para reservar usa tu link personal de invitado.
                      <br />
                      <span className="text-gold">¿No lo tienes? Ingresa tu email en la sección de arriba.</span>
                      <div className="absolute bottom-0 right-4 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-text-base" />
                    </div>
                  )}
                </div>
              </div>
              {gift.totalReservations > 0 && (
                <p className="text-[0.6rem] tracking-widest uppercase text-text-muted mt-3">
                  {gift.totalReservations === 1 ? '1 persona ya lo eligió' : `${gift.totalReservations} personas ya lo eligieron`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
