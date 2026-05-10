import Link from 'next/link'

const FEATURES = [
  {
    icon: '✉',
    title: 'Link personal por invitado',
    desc: 'Cada invitado recibe su propio link único. Sin cuentas, sin contraseñas, sin grupos de WhatsApp.',
  },
  {
    icon: '✓',
    title: 'RSVP online',
    desc: 'Confirmación de asistencia con acompañantes, restricciones dietarias y mensaje. Todo en tiempo real.',
  },
  {
    icon: '◇',
    title: 'Lista de regalos',
    desc: 'Los invitados reservan regalos directamente desde su link. Sin plataformas de terceros ni comisiones.',
  },
  {
    icon: '≡',
    title: 'Panel de gestión',
    desc: 'Todos los invitados, confirmaciones y regalos en un solo lugar. Filtrá, buscá, asigná mesas.',
  },
]

const STEPS = [
  { n: '01', title: 'Contáctanos', desc: 'Completa un formulario con los datos básicos de la boda.' },
  { n: '02', title: 'Creamos tu web', desc: 'En 24 horas tendrás tu página pública y el panel listo para usar.' },
  { n: '03', title: 'Comparte el link', desc: 'Cada invitado recibe su link personal. Tú gestionas todo desde el panel.' },
]

const MODULES = [
  {
    tag: 'RSVP',
    title: 'Confirmación de asistencia',
    desc: 'Los invitados confirman o declaran que no pueden asistir, agregan acompañantes y dejan un mensaje. Tú ves todo en tiempo real con filtros y búsqueda.',
    available: true,
  },
  {
    tag: 'Regalos',
    title: 'Lista de regalos',
    desc: 'Crea tu lista de regalos con foto, precio y link de pago. Los invitados los reservan desde su link personal. Sin comisiones ni plataformas de terceros.',
    available: true,
  },
  {
    tag: 'Próximamente',
    title: 'Mesas y seating',
    desc: 'Asigna invitados a mesas y designa un capitán de mesa por grupo. Vista agrupada para planificar el salón.',
    available: false,
  },
  {
    tag: 'Próximamente',
    title: 'Emails personalizados',
    desc: 'Envía las invitaciones directamente desde el panel, con el link personal de cada invitado y el diseño de tu boda.',
    available: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream font-sans">

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-serif italic text-2xl text-gold tracking-wide">noviosya</span>
        <Link href="/couple/login"
          className="text-[0.7rem] tracking-[0.25em] uppercase text-text-muted hover:text-gold transition-colors">
          Acceso
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-gold mb-6">
          La web de tu boda
        </p>
        <h1 className="font-serif font-light italic text-text-base leading-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}>
          Tu boda, en un link
        </h1>
        <p className="text-text-muted text-base max-w-xl mx-auto leading-relaxed mb-10">
          Invitaciones digitales, RSVP y lista de regalos en un link personalizado para cada invitado.
          Sin apps, sin cuentas, sin complicaciones.
        </p>
        <a href="mailto:hola@noviosya.app?subject=Quiero%20probar%20noviosya"
          className="inline-block bg-gold text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:opacity-90 transition-opacity">
          Quiero probarlo →
        </a>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 max-w-xs mx-auto px-6 mb-20">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
        <div className="w-1.5 h-1.5 bg-gold rotate-45 shrink-0" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
      </div>

      {/* Features */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[0.7rem] tracking-[0.35em] uppercase text-gold text-center mb-3">Qué incluye</p>
          <h2 className="font-serif font-light italic text-text-base text-center mb-14"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Todo lo que necesitas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-5">
                <span className="text-gold text-2xl font-serif shrink-0 mt-0.5 w-7 text-center">{icon}</span>
                <div>
                  <h3 className="font-medium text-text-base text-sm mb-1">{title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-gold text-center mb-3">Cómo funciona</p>
        <h2 className="font-serif font-light italic text-text-base text-center mb-14"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          Simple como debe ser
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="text-center">
              <p className="font-serif italic text-gold text-4xl font-light mb-4">{n}</p>
              <h3 className="font-medium text-text-base text-sm mb-2">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-gold text-center mb-3">Modular</p>
        <h2 className="font-serif font-light italic text-text-base text-center mb-4"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          Activa lo que necesitas
        </h2>
        <p className="text-text-muted text-sm text-center max-w-md mx-auto mb-14 leading-relaxed">
          Cada pareja es distinta. Puedes activar solo el RSVP, solo los regalos, o todo junto — desde el panel, sin tocar código.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {MODULES.map(({ tag, title, desc, available }) => (
            <div key={title}
              className={`p-6 border ${available ? 'border-gold/20 bg-white' : 'border-gold/10 bg-cream/50'}`}>
              <span className={`inline-block text-[0.6rem] tracking-[0.2em] uppercase px-2 py-0.5 mb-3 ${available ? 'bg-gold/10 text-gold' : 'bg-gold/5 text-text-muted/60'}`}>
                {tag}
              </span>
              <h3 className={`font-medium text-sm mb-2 ${available ? 'text-text-base' : 'text-text-muted'}`}>{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-[0.7rem] tracking-[0.35em] uppercase text-gold mb-3">Precio</p>
          <h2 className="font-serif font-light italic text-text-base mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Por definir
          </h2>
          <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Estamos en fase de lanzamiento. Escríbenos y lo creamos juntos.
          </p>
          <a href="mailto:hola@noviosya.app?subject=Quiero%20probar%20noviosya"
            className="inline-block border border-gold text-gold px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gold hover:text-white transition-colors">
            Escribinos
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center border-t border-gold/20">
        <p className="font-serif italic text-gold text-xl mb-2">noviosya</p>
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted/60">
          Hecho con amor por{' '}
          <a href="https://github.com/elgarra" target="_blank" rel="noopener noreferrer"
            className="hover:text-gold transition-colors">@elgarra</a>
        </p>
      </footer>

    </div>
  )
}
