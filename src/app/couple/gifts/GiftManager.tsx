'use client'

import { useState } from 'react'

interface Reservation {
  id: string
  message: string | null
  isConfirmed: boolean
  guest: { firstName: string; lastName: string; email: string | null }
}

interface Gift {
  id: string
  title: string
  description: string | null
  paymentUrl: string | null
  imageUrl: string | null
  price: string | number | null
  currency: string
  sortOrder: number
  reservations: Reservation[]
}

const emptyForm = { title: '', description: '', paymentUrl: '', imageUrl: '', price: '', currency: 'CLP' }

export function GiftManager({ gifts: initial }: { gifts: Gift[]; weddingId: string }) {
  const [gifts, setGifts] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  function startEdit(gift: Gift) {
    setEditingId(gift.id)
    setForm({
      title: gift.title,
      description: gift.description ?? '',
      paymentUrl: gift.paymentUrl ?? '',
      imageUrl: gift.imageUrl ?? '',
      price: gift.price?.toString() ?? '',
      currency: gift.currency,
    })
    setShowForm(true)
  }

  function reset() { setShowForm(false); setEditingId(null); setForm(emptyForm) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, price: form.price ? parseFloat(form.price) : null }

    if (editingId) {
      const res = await fetch(`/api/couple/gifts/${editingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const { gift } = await res.json()
      setGifts(gifts.map((g) => (g.id === editingId ? { ...g, ...gift, reservations: g.reservations } : g)))
    } else {
      const res = await fetch('/api/couple/gifts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const { gift } = await res.json()
      setGifts([...gifts, { ...gift, reservations: [] }])
    }
    setLoading(false)
    reset()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este regalo?')) return
    await fetch(`/api/couple/gifts/${id}`, { method: 'DELETE' })
    setGifts(gifts.filter((g) => g.id !== id))
  }

  async function toggleConfirmed(giftId: string, reservationId: string, current: boolean) {
    await fetch(`/api/couple/gifts/${giftId}/reservations/${reservationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isConfirmed: !current }),
    })
    setGifts(gifts.map((g) =>
      g.id === giftId
        ? { ...g, reservations: g.reservations.map((r) => r.id === reservationId ? { ...r, isConfirmed: !current } : r) }
        : g
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-text-muted text-sm">{gifts.length} regalos en la lista</p>
        <button onClick={() => { reset(); setShowForm(true) }}
          className="bg-gold text-white px-5 py-2 text-sm hover:opacity-90">
          + Agregar regalo
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif italic text-xl text-text-base mb-6">
              {editingId ? 'Editar regalo' : 'Nuevo regalo'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                ['Nombre del regalo *', 'title', 'text', true],
                ['Descripción', 'description', 'text', false],
                ['Link de pago (Mercado Pago, etc.)', 'paymentUrl', 'url', false],
                ['URL de imagen', 'imageUrl', 'url', false],
              ].map(([label, key, type, required]) => (
                <div key={key as string}>
                  <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1">
                    {label as string}
                  </label>
                  <input type={type as string} required={required as boolean}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key as string]: e.target.value })}
                    className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1">Precio</label>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1">Moneda</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold">
                    {['CLP', 'ARS', 'USD', 'EUR'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gold text-white py-2.5 text-sm disabled:opacity-50">
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={reset}
                  className="flex-1 border border-gold/40 text-text-muted py-2.5 text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift list */}
      <div className="space-y-4">
        {gifts.map((gift) => (
          <div key={gift.id} className="bg-white shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-text-base">{gift.title}</h3>
                {gift.description && <p className="text-text-muted text-sm mt-0.5">{gift.description}</p>}
                {gift.price && (
                  <p className="text-gold text-sm mt-1">
                    {Number(gift.price).toLocaleString('es-CL')} {gift.currency}
                  </p>
                )}
                {gift.paymentUrl && (
                  <a href={gift.paymentUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gold/70 hover:text-gold mt-1 block">
                    Link de pago ↗
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <button onClick={() => startEdit(gift)}
                  className="text-xs text-text-muted hover:text-gold border border-gold/20 px-3 py-1">
                  Editar
                </button>
                <button onClick={() => handleDelete(gift.id)}
                  className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1">
                  Eliminar
                </button>
              </div>
            </div>

            {/* Reservations */}
            {gift.reservations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gold/10">
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-2">
                  {gift.reservations.length} reserva{gift.reservations.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {gift.reservations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{r.guest.firstName} {r.guest.lastName}</span>
                        {r.message && <span className="text-text-muted ml-2">"{r.message}"</span>}
                      </div>
                      <button onClick={() => toggleConfirmed(gift.id, r.id, r.isConfirmed)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          r.isConfirmed
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : 'text-text-muted border-gold/20 hover:border-gold'
                        }`}>
                        {r.isConfirmed ? '✓ Recibido' : 'Marcar recibido'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {gifts.length === 0 && (
          <div className="bg-white p-12 text-center shadow-sm">
            <p className="text-text-muted italic font-serif text-xl mb-2">Sin regalos todavía</p>
            <p className="text-text-muted text-sm">Agregá el primero para que los invitados puedan reservar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
