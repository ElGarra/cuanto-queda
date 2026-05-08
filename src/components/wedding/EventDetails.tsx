interface ScheduleItem {
  time: string
  label: string
}

interface EventDetailsProps {
  weddingDate: Date | null
  venueName: string | null
  venueAddress: string | null
  venueMapsUrl: string | null
  scheduleItems: ScheduleItem[]
  dressCode: string | null
}

function TbdBadge({ text = 'Por confirmar' }: { text?: string }) {
  return (
    <span className="inline-block bg-cream text-gold text-[0.65rem] tracking-[0.2em] uppercase px-3 py-1 border border-gold/30 rounded-full">
      {text}
    </span>
  )
}

function DetailCard({ icon, title, children }: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-11 h-11 border border-gold rounded-full flex items-center justify-center text-gold">
        {icon}
      </div>
      <h3 className="font-serif italic text-text-base text-xl">{title}</h3>
      {children}
    </div>
  )
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago',
  })
}

function formatTime(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago',
  })
}

export function EventDetails({
  weddingDate,
  venueName,
  venueAddress,
  venueMapsUrl,
  scheduleItems,
  dressCode,
}: EventDetailsProps) {
  return (
    <section id="detalles" className="bg-white px-6 py-20 text-center">
      <p className="font-light text-[0.72rem] tracking-[0.35em] uppercase text-gold mb-4">
        El gran día
      </p>
      <h2 className="font-serif font-light italic text-text-base mb-12"
        style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}>
        Detalles de la celebración
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto">
        {/* Fecha */}
        <DetailCard
          title="Fecha"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }>
          {weddingDate ? (
            <p className="text-[0.78rem] tracking-wide text-text-muted leading-relaxed capitalize">
              {formatDate(weddingDate)}
            </p>
          ) : (
            <TbdBadge />
          )}
        </DetailCard>

        {/* Lugar */}
        <DetailCard
          title="Lugar"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          }>
          {venueName ? (
            <>
              <p className="text-[0.78rem] tracking-wide text-text-muted leading-relaxed">
                {venueName}
                {venueAddress && <><br />{venueAddress}</>}
              </p>
              {venueMapsUrl && (
                <a
                  href={venueMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold text-[0.65rem] tracking-[0.2em] uppercase border border-gold/30 px-3 py-1 rounded-full hover:bg-gold hover:text-white transition-colors">
                  Ver mapa
                </a>
              )}
            </>
          ) : (
            <TbdBadge text="Próximamente" />
          )}
        </DetailCard>

        {/* Horario */}
        <DetailCard
          title="Horario"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }>
          {scheduleItems.length > 0 ? (
            <ul className="text-[0.78rem] tracking-wide text-text-muted leading-loose">
              {scheduleItems.map((item, i) => (
                <li key={i}><span className="text-gold">{item.time}</span> — {item.label}</li>
              ))}
            </ul>
          ) : weddingDate ? (
            <p className="text-[0.78rem] tracking-wide text-text-muted">{formatTime(weddingDate)} hs</p>
          ) : (
            <TbdBadge />
          )}
        </DetailCard>
      </div>

      {/* Dress code */}
      {dressCode && (
        <p className="mt-12 text-[0.78rem] tracking-[0.2em] uppercase text-text-muted">
          Dress code &nbsp;·&nbsp; <span className="text-gold">{dressCode}</span>
        </p>
      )}
    </section>
  )
}
