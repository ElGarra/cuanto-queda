interface FooterProps {
  partner1Name: string
  partner2Name: string
  weddingDate: Date | null
}

export function Footer({ partner1Name, partner2Name, weddingDate }: FooterProps) {
  const year = weddingDate?.getFullYear() ?? new Date().getFullYear()

  return (
    <footer className="bg-cream border-t border-gold/20 px-6 py-10 text-center">
      <p className="font-serif italic font-light text-gold text-2xl tracking-wide">
        {partner1Name} &amp; {partner2Name}
      </p>
      <p className="mt-2 text-[0.68rem] tracking-[0.2em] uppercase text-text-muted">
        Con amor &nbsp;·&nbsp; {year}
      </p>
      <p className="mt-5 text-[0.6rem] tracking-wide text-text-muted/60">
        Hecho con amor por{' '}
        <a
          href="https://github.com/elgarra"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:opacity-70 transition-opacity">
          @elgarra
        </a>
      </p>
    </footer>
  )
}
