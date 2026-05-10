'use client'

import { useState } from 'react'
import { RSVPForm } from './RSVPForm'

interface Gift {
  id: string
  title: string
  description: string | null
  paymentUrl: string | null
  imageUrl: string | null
  price: number | null
  currency: string
  totalReservations: number
  reservedByMe: boolean
  myMessage: string
}

interface Props {
  token: string
  features: { rsvp: boolean; gifts: boolean }
  guest: { maxCompanions: number }
  rsvp: { status: 'CONFIRMED' | 'DECLINED'; companions: { firstName: string; lastName: string; dietaryRestrictions?: string }[]; dietaryRestrictions: string; message: string } | null
  isOpen: boolean
  deadlineStr: string | null
  gifts: Gift[]
}

export function GuestTabs({ token, features, guest, rsvp, isOpen, deadlineStr, gifts }: Props) {
  const [tab, setTab] = useState<'rsvp' | 'gifts'>(features.rsvp ? 'rsvp' : 'gifts')
  const [giftStates, setGiftStates] = useState<Record<string, { reserved: boolean; message: string; loading: boolean }>>(
    Object.fromEntries(gifts.map((g) => [g.id, { reserved: g.reservedByMe, message: g.myMessage, loading: false }]))
  )
  const [activeMessage, setActiveMessage] = useState<string | null>(null)

  async function toggleReserve(gift: Gift) {
    const state = giftStates[gift.id]
    setGiftStates((prev) => ({ ...prev, [gift.id]: { ...prev[gift.id], loading: true } }))

    if (state.reserved) {
      await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      setGiftStates((prev) => ({ ...prev, [gift.id]: { reserved: false, message: '', loading: false } }))
    } else {
      await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: state.message }),
      })
      setGiftStates((prev) => ({ ...prev, [gift.id]: { ...prev[gift.id], reserved: true, loading: false } }))
      setActiveMessage(null)
    }
  }

  return (
    <>
      {/* Tab bar — only show tabs for enabled features */}
      {(features.rsvp && features.gifts) && (
        <div className="flex border-b border-gold/20 bg-white">
          {[
            features.rsvp  && { id: 'rsvp',  label: 'Confirmación' },
            features.gifts && { id: 'gifts', label: `Regalos${gifts.length ? ` (${gifts.length})` : ''}` },
          ].filter(Boolean).map(({ id, label }: { id: string; label: string }) => (
            <button key={id} onClick={() => setTab(id as 'rsvp' | 'gifts')}
              className={`flex-1 py-3.5 text-xs tracking-[0.2em] uppercase transition-colors ${
                tab === id ? 'text-gold border-b-2 border-gold' : 'text-text-muted hover:text-gold'
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-8 max-w-md mx-auto">
        {/* RSVP tab */}
        {tab === 'rsvp' && (
          <div className="bg-white p-8 shadow-sm">
            {isOpen ? (
              <RSVPForm token={token} maxCompanions={guest.maxCompanions} initialRsvp={rsvp} />
            ) : (
              <div className="text-center py-6">
                {deadlineStr
                  ? <p className="text-text-muted text-sm">El período de confirmación cerró el {deadlineStr}.</p>
                  : <p className="text-text-muted text-sm">Las confirmaciones están cerradas.</p>}
                {rsvp && (
                  <p className="mt-4 text-sm">
                    Tu respuesta: <span className={`font-medium ${rsvp.status === 'CONFIRMED' ? 'text-green-600' : 'text-red-500'}`}>
                      {rsvp.status === 'CONFIRMED' ? 'Confirmado ✓' : 'No asiste'}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Gifts tab */}
        {tab === 'gifts' && (
          <div className="space-y-4">
            {gifts.length === 0 && (
              <p className="text-center text-text-muted italic font-serif text-xl py-12">
                La lista de regalos está en preparación.
              </p>
            )}
            {gifts.map((gift) => {
              const state = giftStates[gift.id]
              return (
                <div key={gift.id} className={`bg-white shadow-sm p-5 border-l-2 ${state.reserved ? 'border-gold' : 'border-transparent'}`}>
                  {gift.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={gift.imageUrl} alt={gift.title}
                      className="w-full h-36 object-cover mb-4 rounded" />
                  )}
                  <h3 className="font-medium text-text-base">{gift.title}</h3>
                  {gift.description && <p className="text-text-muted text-sm mt-0.5">{gift.description}</p>}
                  {gift.price && (
                    <p className="text-gold text-sm mt-1">
                      {gift.price.toLocaleString('es-CL')} {gift.currency}
                    </p>
                  )}
                  {gift.totalReservations > 0 && (
                    <p className="text-[0.65rem] tracking-widest uppercase text-text-muted mt-2">
                      {gift.totalReservations} persona{gift.totalReservations > 1 ? 's' : ''} ya reservó{gift.totalReservations > 1 ? 'aron' : ''} este regalo
                    </p>
                  )}

                  {/* Message input (shown before reserving) */}
                  {activeMessage === gift.id && !state.reserved && (
                    <textarea
                      placeholder="Dejá un mensaje (opcional)"
                      value={state.message}
                      onChange={(e) => setGiftStates((prev) => ({ ...prev, [gift.id]: { ...prev[gift.id], message: e.target.value } }))}
                      rows={2}
                      maxLength={500}
                      className="w-full mt-3 border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none"
                    />
                  )}

                  <div className="flex gap-2 mt-4 flex-wrap">
                    {state.reserved ? (
                      <>
                        <span className="text-xs text-gold bg-amber-50 border border-gold/20 px-3 py-1.5 rounded-full">
                          ✓ Reservado por ti
                        </span>
                        {gift.paymentUrl && (
                          <a href={gift.paymentUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs bg-gold text-white px-4 py-1.5 hover:opacity-90">
                            Ir al pago ↗
                          </a>
                        )}
                        <button onClick={() => toggleReserve(gift)} disabled={state.loading}
                          className="text-xs text-text-muted hover:text-red-500 underline">
                          Cancelar reserva
                        </button>
                      </>
                    ) : (
                      <>
                        {activeMessage === gift.id ? (
                          <>
                            <button onClick={() => toggleReserve(gift)} disabled={state.loading}
                              className="text-xs bg-gold text-white px-4 py-1.5 hover:opacity-90 disabled:opacity-50">
                              {state.loading ? 'Reservando...' : 'Confirmar reserva'}
                            </button>
                            <button onClick={() => setActiveMessage(null)}
                              className="text-xs text-text-muted underline">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setActiveMessage(gift.id)}
                            className="text-xs border border-gold/40 text-gold px-4 py-1.5 hover:bg-gold hover:text-white transition-colors">
                            Quiero regalar esto
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
