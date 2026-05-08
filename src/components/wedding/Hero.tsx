import Link from 'next/link'
import { Divider } from './Ornament'

interface HeroProps {
  partner1Name: string
  partner2Name: string
  weddingDate: Date | null
}

function formatDate(date: Date | null): string {
  if (!date) return 'Fecha por confirmar'
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago',
  })
}

export function Hero({ partner1Name, partner2Name, weddingDate }: HeroProps) {
  return (
    <section className="relative min-h-svh flex flex-col items-center justify-start text-center px-6 pt-16 pb-10 bg-white overflow-hidden">
      {/* Radial gold glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 70%)
          `,
        }}
      />

      {/* Content group — vertically centered in available space */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gold tracking-[0.35em] uppercase font-light text-lg opacity-85 mb-7 animate-fade-up">
          Nos casamos
        </p>

        <Divider />

        <h1 className="font-serif font-light leading-[1.05] text-text-base animate-fade-up"
          style={{ fontSize: 'clamp(3.2rem, 10vw, 7rem)' }}>
          <em className="italic text-gold">{partner1Name}</em>
          <span className="block text-[0.55em] text-gold italic my-1">&amp;</span>
          <em className="italic text-gold">{partner2Name}</em>
        </h1>

        <Divider />

        <p className="font-light text-[0.8rem] tracking-[0.3em] uppercase text-text-muted mt-2 animate-fade-up">
          {formatDate(weddingDate)}
        </p>
      </div>

      {/* Scroll CTA */}
      <Link
        href="#detalles"
        className="flex flex-col items-center gap-1.5 text-gold opacity-70 no-underline transition-opacity hover:opacity-100 animate-bounce-y"
      >
        <span className="text-[0.6rem] tracking-[0.25em] uppercase font-light">Ver detalles</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Link>
    </section>
  )
}
