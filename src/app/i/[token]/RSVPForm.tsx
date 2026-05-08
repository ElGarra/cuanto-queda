'use client'

import { useState } from 'react'

interface Companion {
  firstName: string
  lastName: string
  dietaryRestrictions?: string
}

interface InitialRsvp {
  status: 'CONFIRMED' | 'DECLINED'
  companions: Companion[]
  dietaryRestrictions: string
  message: string
}

interface Props {
  token: string
  maxCompanions: number
  initialRsvp: InitialRsvp | null
}

export function RSVPForm({ token, maxCompanions, initialRsvp }: Props) {
  const [status, setStatus] = useState<'CONFIRMED' | 'DECLINED' | null>(
    initialRsvp?.status ?? null
  )
  const [companions, setCompanions] = useState<Companion[]>(initialRsvp?.companions ?? [])
  const [dietary, setDietary] = useState(initialRsvp?.dietaryRestrictions ?? '')
  const [message, setMessage] = useState(initialRsvp?.message ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addCompanion() {
    if (companions.length >= maxCompanions) return
    setCompanions([...companions, { firstName: '', lastName: '' }])
  }

  function removeCompanion(i: number) {
    setCompanions(companions.filter((_, idx) => idx !== i))
  }

  function updateCompanion(i: number, field: keyof Companion, value: string) {
    setCompanions(companions.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!status) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, companions, dietaryRestrictions: dietary, message }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="text-2xl mb-3">{status === 'CONFIRMED' ? '🎉' : '💌'}</p>
        <p className="font-serif italic text-text-base text-xl mb-2">
          {status === 'CONFIRMED' ? '¡Nos vemos pronto!' : 'Gracias por avisarnos'}
        </p>
        <p className="text-text-muted text-sm">
          {status === 'CONFIRMED'
            ? 'Tu asistencia está confirmada. Si necesitás cambiar algo, volvé a este link.'
            : 'Recibimos tu respuesta. Podés cambiarla cuando quieras.'}
        </p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-gold text-xs underline">
          Modificar respuesta
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Asistencia */}
      <div>
        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-text-muted mb-3">
          ¿Vas a asistir?
        </p>
        <div className="flex gap-3">
          {(['CONFIRMED', 'DECLINED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-3 text-sm border transition-colors ${
                status === s
                  ? 'bg-gold text-white border-gold'
                  : 'border-gold/40 text-text-muted hover:border-gold'
              }`}>
              {s === 'CONFIRMED' ? 'Sí, asisto' : 'No puedo asistir'}
            </button>
          ))}
        </div>
      </div>

      {status === 'CONFIRMED' && (
        <>
          {/* Acompañantes */}
          {maxCompanions > 0 && (
            <div>
              <p className="text-[0.7rem] tracking-[0.2em] uppercase text-text-muted mb-3">
                Acompañantes (máx. {maxCompanions})
              </p>
              <div className="space-y-4">
                {companions.map((c, i) => (
                  <div key={i} className="border border-gold/20 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">Acompañante {i + 1}</span>
                      <button type="button" onClick={() => removeCompanion(i)}
                        className="text-xs text-red-400 hover:text-red-600">
                        Eliminar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Nombre"
                        value={c.firstName}
                        onChange={(e) => updateCompanion(i, 'firstName', e.target.value)}
                        className="border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold"
                        required
                      />
                      <input
                        placeholder="Apellido"
                        value={c.lastName}
                        onChange={(e) => updateCompanion(i, 'lastName', e.target.value)}
                        className="border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                    <input
                      placeholder="Restricciones alimentarias (opcional)"
                      value={c.dietaryRestrictions ?? ''}
                      onChange={(e) => updateCompanion(i, 'dietaryRestrictions', e.target.value)}
                      className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                ))}
                {companions.length < maxCompanions && (
                  <button type="button" onClick={addCompanion}
                    className="w-full py-2 border border-dashed border-gold/40 text-gold text-xs hover:border-gold transition-colors">
                    + Agregar acompañante
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Restricciones propias */}
          <div>
            <label className="block text-[0.7rem] tracking-[0.2em] uppercase text-text-muted mb-2">
              Restricciones alimentarias
            </label>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Vegetariano, celíaco, alergias..."
              className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </>
      )}

      {/* Mensaje */}
      <div>
        <label className="block text-[0.7rem] tracking-[0.2em] uppercase text-text-muted mb-2">
          Mensaje para los novios (opcional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Escribí algo lindo..."
          className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!status || loading}
        className="w-full bg-gold text-white py-3 text-sm tracking-[0.15em] uppercase disabled:opacity-50 hover:opacity-90 transition-opacity">
        {loading ? 'Guardando...' : initialRsvp ? 'Actualizar respuesta' : 'Confirmar'}
      </button>
    </form>
  )
}
