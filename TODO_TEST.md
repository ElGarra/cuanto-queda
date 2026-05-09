# Testing pendiente

## Admin (localhost:3000/admin/login)
`joaquin.castanos@gmail.com` / `Admin123!`
- [ ] Login correcto → dashboard
- [ ] Login pass incorrecta → error
- [ ] 5 intentos → rate limit 15 min
- [ ] /admin/users → crear COUPLE → eliminar
- [ ] Admin puede entrar a /couple/dashboard

## Novio/a (localhost:3000/couple/login)
`florencia@test.com` / `Novios123!`
- [ ] Login → stats (10 invitados, 0 confirmados)
- [ ] Nuestra boda → editar dress code → ver en landing
- [ ] Invitados → buscar "Valentina", filtrar Confirmados (vacío)
- [ ] Asignar mesa "1" a Valentina inline → Enter
- [ ] Botón Link → copia portapapeles
- [ ] Agregar invitado nuevo
- [ ] Panel dietas 🥗 (vacío hasta que alguien confirme)
- [ ] Regalos → agregar regalo con precio + link pago → ver en landing
- [ ] Mi cuenta → pass inválida (sin mayúscula) → ver error
- [ ] Ir a /admin/dashboard → debe redirigir

## Invitados

**Valentina +1:** localhost:3000/i/effbyixCGcyg34t2Hn6xP
- [ ] Ve su nombre
- [ ] Declinar → cambiar a Confirmar
- [ ] Agregar acompañante con nombre + dieta
- [ ] Dejar mensaje
- [ ] Tab Regalos → "Reservar" → tooltip
- [ ] Volver al CRM: Valentina confirmada + acompañante + dieta en 🥗

**Diego +2:** localhost:3000/i/uUixCCjjBj5SvnUazkaMS
- [ ] Confirmar + 2 acompañantes
- [ ] Intentar 3ero → bloqueado
- [ ] CRM: Total personas subió

**Camila sin acompañantes:** localhost:3000/i/QIWR60pLjFUoW7ePWT98x
- [ ] Confirmar → sin opción acompañantes
- [ ] Reservar regalo → ver link pago
- [ ] Cancelar → volver a reservar
- [ ] Panel regalos de Florencia: ver reserva + marcar recibido

## Landing (localhost:3000)
- [ ] Fonts OK, countdown andando
- [ ] Casona San Ignacio · 15:00 hs
- [ ] Email Camila → misma respuesta que email falso
- [ ] Gift cards → "Reservar" tooltip
- [ ] Footer "· acceso ·" → couple/login

## Seguridad rápida
- [ ] Como Florencia (COUPLE): GET localhost:3000/api/admin/users → 401
- [ ] Link de Valentina estando logueado como Florencia → contextos no se mezclan
