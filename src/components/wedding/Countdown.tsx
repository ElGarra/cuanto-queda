'use client'

import { Fragment, useEffect, useState } from 'react'

interface CountdownProps {
  weddingDate: string | null // ISO string from server
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

export function Countdown({ weddingDate }: CountdownProps) {
  const target = weddingDate ? new Date(weddingDate) : null
  // Start as null — avoids SSR/client hydration mismatch from Date.now()
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!target) return
    setTime(getTimeLeft(target))
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [weddingDate]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="bg-cream px-6 py-20 text-center">
      <p className="font-light text-[0.72rem] tracking-[0.35em] uppercase text-gold mb-4">
        Faltan
      </p>
      <h2 className="font-serif font-light italic text-text-base mb-12"
        style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}>
        Contando los días
      </h2>

      {time ? (
        <div className="flex justify-center flex-wrap gap-4 sm:gap-12">
          {[
            { value: pad(time.days),    label: 'Días' },
            { value: pad(time.hours),   label: 'Horas' },
            { value: pad(time.minutes), label: 'Minutos' },
            { value: pad(time.seconds), label: 'Segundos' },
          ].map(({ value, label }, i) => (
            <Fragment key={label}>
              {i > 0 && (
                <span
                  className="font-serif text-gold opacity-50 self-start"
                  style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)' }}>
                  ·
                </span>
              )}
              <div className="flex flex-col items-center min-w-[80px]">
                <span
                  className="font-serif font-light text-text-base leading-none relative after:block after:w-full after:h-px after:bg-gradient-to-r after:from-transparent after:via-gold after:to-transparent after:mt-2"
                  style={{ fontSize: 'clamp(3rem, 9vw, 5.5rem)' }}>
                  {value}
                </span>
                <span className="font-light text-[0.65rem] tracking-[0.3em] uppercase text-text-muted mt-2.5">
                  {label}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      ) : (
        <p className="text-text-muted italic font-serif text-xl">Fecha por confirmar</p>
      )}
    </section>
  )
}
