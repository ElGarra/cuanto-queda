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
    rsvpEnabled:   wedding.rsvpEnabled,
    giftsEnabled:  wedding.giftsEnabled,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function field(label: string, key: keyof typeof form, type = 'text', placeholder = '') {
    return (
      <div key={key as string}>
        <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-1.5">{label}</label>
        <input type={type} value={form[key] as string} placeholder={placeholder}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
      </div>
    )
  }

  function toggle(label: string, description: string, key: 'rsvpEnabled' | 'giftsEnabled') {
    return (
      <label key={key} className="flex items-center justify-between p-4 border border-gold/20 cursor-pointer hover:border-gold/40 transition-colors">
        <div>
          <p className="text-sm font-medium text-text-base">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
        <div
          onClick={() => setForm({ ...form, [key]: !form[key] })}
          className={`relative w-10 h-5 rounded-full transition-colors ${form[key] ? 'bg-gold' : 'bg-gold/20'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[key] ? 'left-5' : 'left-0.5'}`} />
        </div>
      </label>
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="bg-white p-8 shadow-sm space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {field('Novio/a 1', 'partner1Name')}
          {field('Novio/a 2', 'partner2Name')}
        </div>
        {field('Fecha y hora de la ceremonia', 'weddingDate', 'datetime-local')}
        {field('Nombre del venue', 'venueName', 'text', 'Ej. Casa de Campo, Hotel...')}
        {field('Dirección', 'venueAddress')}
        {field('Link Google Maps', 'venueMapsUrl', 'url', 'https://maps.google.com/...')}
        {field('Dress code', 'dressCode', 'text', 'Ej. Formal, Semi-formal...')}
      </div>

      <div className="bg-white p-6 shadow-sm">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-4">Funcionalidades activas</p>
        <div className="space-y-2">
          {toggle('Confirmación de asistencia (RSVP)', 'Los invitados pueden confirmar o declinar su asistencia', 'rsvpEnabled')}
          {toggle('Lista de regalos', 'Los invitados pueden ver y reservar regalos', 'giftsEnabled')}
        </div>
      </div>

      <div className="flex items-center gap-4">
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
