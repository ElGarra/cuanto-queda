'use client'

import { useState } from 'react'

interface Props {
  weddingId: string
  rsvpEnabled: boolean
  giftsEnabled: boolean
}

const FEATURES = [
  {
    key: 'rsvpEnabled' as const,
    label: 'Confirmación de asistencia (RSVP)',
    description: 'Los invitados pueden confirmar o declinar su asistencia desde su link personal.',
  },
  {
    key: 'giftsEnabled' as const,
    label: 'Lista de regalos',
    description: 'Los invitados pueden ver y reservar regalos desde su link personal.',
  },
]

export function FeatureToggles({ weddingId, rsvpEnabled, giftsEnabled }: Props) {
  const [features, setFeatures] = useState({ rsvpEnabled, giftsEnabled })
  const [saving, setSaving] = useState<string | null>(null)

  async function toggle(key: 'rsvpEnabled' | 'giftsEnabled') {
    setSaving(key)
    const newVal = !features[key]
    const res = await fetch(`/api/admin/weddings/${weddingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: newVal }),
    })
    if (res.ok) setFeatures({ ...features, [key]: newVal })
    setSaving(null)
  }

  return (
    <div className="space-y-3">
      {FEATURES.map(({ key, label, description }) => (
        <div key={key}
          className="flex items-center justify-between p-4 border border-gold/15 hover:border-gold/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-text-base">{label}</p>
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          </div>
          <button
            onClick={() => toggle(key)}
            disabled={saving === key}
            className="ml-6 shrink-0">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${features[key] ? 'bg-gold' : 'bg-gold/20'} ${saving === key ? 'opacity-50' : ''}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${features[key] ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}
