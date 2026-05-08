'use client'

import { useState } from 'react'
import type { Wedding } from '@prisma/client'

export function WeddingForm({ wedding }: { wedding: Wedding }) {
  const [form, setForm] = useState({
    partner1Name:  wedding.partner1Name,
    partner2Name:  wedding.partner2Name,
    weddingDate:   wedding.weddingDate ? new Date(wedding.weddingDate).toISOString().slice(0, 16) : '',
    venueName:     wedding.venueName ?? '',
    venueAddress:  wedding.venueAddress ?? '',
    venueMapsUrl:  wedding.venueMapsUrl ?? '',
    dressCode:     wedding.dressCode ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function field(label: string, key: keyof typeof form, type = 'text', placeholder = '') {
    return (
      <div key={key}>
        <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-1.5">
          {label}
        </label>
        <input type={type} value={form[key]} placeholder={placeholder}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    setError(null)
    const res = await fetch('/api/couple/wedding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        weddingDate: form.weddingDate ? new Date(form.weddingDate).toISOString() : null,
      }),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else setError('Error al guardar')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm space-y-6 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        {field('Novio/a 1', 'partner1Name')}
        {field('Novio/a 2', 'partner2Name')}
      </div>
      {field('Fecha y hora de la ceremonia', 'weddingDate', 'datetime-local')}
      {field('Nombre del venue', 'venueName', 'text', 'Ej. Casa de Campo, Hotel...')}
      {field('Dirección', 'venueAddress')}
      {field('Link Google Maps', 'venueMapsUrl', 'url', 'https://maps.google.com/...')}
      {field('Dress code', 'dressCode', 'text', 'Ej. Formal, Semi-formal, Colores pasteles...')}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={loading}
          className="bg-gold text-white px-8 py-2.5 text-sm tracking-[0.15em] uppercase disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </form>
  )
}
