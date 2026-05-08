'use client'

import { useState } from 'react'

export function GuestActions({ weddingId: _weddingId }: { weddingId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', maxCompanions: 0, group: '',
  })

  async function addGuest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/admin/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setShowForm(false)
    setForm({ firstName: '', lastName: '', email: '', maxCompanions: 0, group: '' })
    window.location.reload()
  }

  return (
    <div className="flex gap-3 items-start">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm bg-gold text-white px-5 py-2.5 hover:opacity-90 transition-opacity">
        + Agregar invitado
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md p-8 shadow-xl">
            <h2 className="font-serif italic text-xl text-text-base mb-6">Nuevo invitado</h2>
            <form onSubmit={addGuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Nombre" value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                <input required placeholder="Apellido" value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              </div>
              <input type="email" placeholder="Email (opcional)" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.65rem] tracking-widest uppercase text-text-muted block mb-1">
                    Acompañantes permitidos
                  </label>
                  <input type="number" min={0} max={10} value={form.maxCompanions}
                    onChange={(e) => setForm({ ...form, maxCompanions: Number(e.target.value) })}
                    className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-[0.65rem] tracking-widest uppercase text-text-muted block mb-1">
                    Grupo
                  </label>
                  <input placeholder="familia / amigos..." value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                    className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gold text-white py-2.5 text-sm disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gold/40 text-text-muted py-2.5 text-sm hover:border-gold">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
