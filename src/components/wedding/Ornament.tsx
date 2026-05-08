export function Divider() {
  return (
    <div className="flex items-center gap-4 my-5">
      <div className="w-15 h-px bg-gradient-to-r from-transparent to-gold" />
      <div className="w-1.5 h-1.5 bg-gold rotate-45 shrink-0" />
      <div className="w-15 h-px bg-gradient-to-l from-transparent to-gold" />
    </div>
  )
}
