'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CoupleUser {
  name:     string
  email:    string
  password: string
}

export function NewWeddingForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [form, setForm] = useState({
    partner1Name: '',
    partner2Name: '',
    weddingDate:  '',
    venueName:    '',
    venueAddress: '',
    dressCode:    '',
  })

  const [couple, setCouple] = useState<CoupleUser[]>([
    { name: '', email: '', password: '' },
    { name: '', email: '', password: '' },
  ])

  function setField(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function setCoupleMember(i: number, key: keyof CoupleUser, val: string) {
    setCouple(c => c.map((m, idx) => idx === i ? { ...m, [key]: val } : m))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const validCouple = couple.filter(m => m.email && m.name && m.password)
    if (validCouple.length === 0) {
      setError('Agregá al menos una cuenta para los novios.')
      setSaving(false)
      return
    }

    const res = await fetch('/api/admin/weddings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        weddingDate: form.weddingDate ? new Date(form.weddingDate).toISOString() : null,
        venueName:   form.venueName   || undefined,
        venueAddress:form.venueAddress|| undefined,
        dressCode:   form.dressCode   || undefined,
        couple: validCouple,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al crear la boda')
      setSaving(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  const inputClass = 'w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white'
  const labelClass = 'block text-[0.68rem] tracking-[0.15em] uppercase text-text-muted mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Pareja */}
      <div className="bg-white shadow-sm p-6 space-y-4">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-2">La pareja</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre 1 *</label>
            <input className={inputClass} required value={form.partner1Name}
              onChange={e => setField('partner1Name', e.target.value)} placeholder="Florencia" />
          </div>
          <div>
            <label className={labelClass}>Nombre 2 *</label>
            <input className={inputClass} required value={form.partner2Name}
              onChange={e => setField('partner2Name', e.target.value)} placeholder="Matias" />
          </div>
        </div>
      </div>

      {/* Boda */}
      <div className="bg-white shadow-sm p-6 space-y-4">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-2">Detalles (opcionales)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha y hora</label>
            <input type="datetime-local" className={inputClass} value={form.weddingDate}
              onChange={e => setField('weddingDate', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Dress code</label>
            <input className={inputClass} value={form.dressCode}
              onChange={e => setField('dressCode', e.target.value)} placeholder="Formal" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Venue</label>
          <input className={inputClass} value={form.venueName}
            onChange={e => setField('venueName', e.target.value)} placeholder="Casona San Ignacio" />
        </div>
        <div>
          <label className={labelClass}>Dirección</label>
          <input className={inputClass} value={form.venueAddress}
            onChange={e => setField('venueAddress', e.target.value)} placeholder="Caupolicán 8611, Quilicura" />
        </div>
      </div>

      {/* Cuentas novios */}
      <div className="bg-white shadow-sm p-6 space-y-6">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-2">
          Cuentas de los novios <span className="normal-case tracking-normal text-text-muted/60">(mínimo 1)</span>
        </p>
        {couple.map((m, i) => (
          <div key={i} className="space-y-3">
            <p className="text-xs text-text-muted font-medium">Novio/a {i + 1}</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Nombre</label>
                <input className={inputClass} value={m.name}
                  onChange={e => setCoupleMember(i, 'name', e.target.value)}
                  placeholder="Florencia" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} value={m.email}
                  onChange={e => setCoupleMember(i, 'email', e.target.value)}
                  placeholder="florencia@email.com" />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <input type="password" className={inputClass} value={m.password}
                  onChange={e => setCoupleMember(i, 'password', e.target.value)}
                  placeholder="Mín. 8 chars, mayúscula, número" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-gold text-white px-6 py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? 'Creando...' : 'Crear boda'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gold/30 text-text-muted px-6 py-2.5 text-sm hover:border-gold hover:text-gold transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
