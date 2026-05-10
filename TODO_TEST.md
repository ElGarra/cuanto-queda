# Testing completo — cuanto-queda

> **Estado:** Tests automáticos corridos 2026-05-10 — 94 ✓ PASS, 0 ✗ FAIL, 30 👁 requieren revisión manual
> Correr tests: `bash tests/run-all.sh`

Credenciales: ver `tests/.env.test` (no commiteado)

Links invitados:
- Valentina Morales +1 → /i/effbyixCGcyg34t2Hn6xP
- Sebastián Fernández +1 → /i/UtSGMaNgHAF039kR3J7DR
- Tomás Herrera (sin +1) → /i/tdsbuj6dcUYM1xAqGS8Bj
- Valentina Morales +1 → /i/effbyixCGcyg34t2Hn6xP
- Ignacio Muñoz (sin email) → /i/e9G2kjUMR71htRzaAW6Pv
- Nicolás Pérez (sin +1) → /i/sw5zZ6D8wr4ny3lIUVGBo
- Diego Ramírez +2 → /i/uUixCCjjBj5SvnUazkaMS
- Javiera Soto +1 (sin email) → /i/jks40pCq6Z98YcBNrqmJo
- Camila Torres (sin +1) → /i/QIWR60pLjFUoW7ePWT98x
- Isadora Vega +1 → /i/LiIIz047cYsIpW31q8eE5
- Antonia Castillo +1 → /i/NtLmm8KfDaN9KDAkWKrZs

---

## Leyenda
- ✅ Testeado automáticamente — PASA
- 👁 Requiere revisión manual (visual / UI)
- [ ] Pendiente

---

## 1. AUTH — Login / Logout

### Admin login (/admin/login)
- ✅ Login correcto → sesión establecida
- ✅ Email correcto, contraseña incorrecta → no sesión
- ✅ Email inexistente → mismo comportamiento (no revela si existe)
- [ ] 5 intentos fallidos seguidos → bloqueado, mensaje de rate limit
- [ ] Después de 15 min → puede volver a intentar
- [ ] Campo email vacío → no envía
- [ ] Campo password vacío → no envía
- ✅ URL directa /admin/dashboard sin login → redirige a login

### Couple login (/couple/login)
- ✅ Login Florencia → sesión establecida
- ✅ Login Matias → sesión establecida
- ✅ Contraseña incorrecta → no sesión
- ✅ Rate limit igual que admin (endpoint devuelve error)
- ✅ URL directa /couple/dashboard sin login → redirige a login
- ✅ URL directa /couple/guests sin login → redirige a login
- [ ] Mensaje "✓ Contraseña actualizada" si viene de reset (?reset=1)

### Forgot password (/forgot-password)
- ✅ Email registrado → 200 (no confirma)
- ✅ Email NO registrado → misma respuesta 200 (no revela)
- [ ] Email inválido (sin @) → no envía
- [ ] 3 intentos seguidos → rate limit, pero igual devuelve 200

### Reset password (/reset-password/[token])
- [ ] Token válido → muestra formulario
- [ ] Token inválido/inventado → "Link inválido o expirado"
- [ ] Token ya usado → "Link inválido o expirado"
- [ ] Contraseña sin mayúscula → indicador rojo, no guarda
- [ ] Contraseña sin número → indicador rojo, no guarda
- [ ] Menos de 8 caracteres → indicador rojo, no guarda
- [ ] Contraseñas no coinciden → error
- [ ] Contraseña válida → guarda, redirige a /couple/login con mensaje

---

## 2. ADMIN DASHBOARD (/admin/dashboard)

- ✅ Muestra nombre de la boda (Florencia & Matias)
- 👁 Muestra fecha y venue
- 👁 Stats: 10 invitados, 0 confirmados, 0 no asisten, 10 sin respuesta
- ✅ Toggle RSVP OFF → landing no muestra formulario RSVP
- ✅ Toggle RSVP ON → vuelve a aparecer
- ✅ Toggle Regalos OFF → landing no muestra sección regalos
- ✅ Toggle Regalos ON → todo vuelve
- ✅ Ambos OFF → landing solo muestra hero + countdown + detalles
- ✅ Botón "Entrar como novios" → couple dashboard
- [ ] Desde couple panel, botón "Admin" → vuelve a /admin/dashboard
- [ ] Links rápidos: Invitados, Regalos, Info boda, Usuarios, Landing → cargan

---

## 3. ADMIN USUARIOS (/admin/users)

- ✅ Lista usuarios existentes (Joaquin ADMIN, Florencia COUPLE, Matias COUPLE)
- ✅ Crear usuario COUPLE con email, nombre, contraseña válida → aparece en lista
- [ ] Crear usuario ADMIN → aparece con badge Admin
- ✅ Contraseña inválida al crear → error de validación
- ✅ Email duplicado → error "Ya existe un usuario con ese email"
- ✅ Eliminar usuario recién creado → desaparece
- 👁 Eliminar a sí mismo (Joaquin) → no debe poder (protección)

---

## 4. COUPLE DASHBOARD (/couple/dashboard)

- ✅ Muestra "Hola, Florencia" / "Hola, Matias"
- 👁 Stats: 10 invitados, confirmados/pendientes/no asisten
- 👁 Días restantes hasta la boda
- 👁 Cards de regalos (total + reservados)
- [ ] Link "Gestionar regalos" → /couple/gifts
- [ ] Link "Editar info" → /couple/wedding
- [ ] Stats son links → llevan a /couple/guests con filtro correcto

---

## 5. NUESTRA BODA (/couple/wedding)

- [ ] Campos precompletados con datos actuales
- [ ] Cambiar nombre Florencia → guardar → ver en landing y panel
- [ ] Cambiar fecha → guardar → ver en countdown y detalles
- [ ] Agregar venue (si no hay) → guardar → ver en detalles
- ✅ Link Google Maps vacío → guarda sin error
- ✅ Link Google Maps inválido (sin https) → error de validación
- [ ] Dress code → guardar → ver en landing
- [ ] Toggle RSVP OFF → nav de couple oculta nada (RSVP no tiene tab propio)
- [ ] Toggle Regalos OFF → "Regalos" desaparece del nav
- [ ] Toggle Regalos ON → vuelve al nav
- ✅ Guardar sin cambios → OK sin error

---

## 6. INVITADOS CRM (/couple/guests)

### Stats
- [ ] Muestra total, confirmados, pendientes, total personas
- [ ] Total personas sube al confirmar con acompañantes

### Búsqueda y filtros
- 👁 Buscar "Valentina" → solo Valentina
- 👁 Buscar "val" (parcial) → Valentina
- 👁 Buscar email "val@test" → Valentina
- 👁 Buscar texto que no existe → "Sin resultados"
- 👁 Tab Todos → 10 invitados
- 👁 Tab Confirmados → vacío al inicio
- 👁 Tab Pendientes → 10 al inicio
- 👁 Tab No asisten → vacío al inicio
- 👁 Combinar filtro + búsqueda → funciona

### Mesa (inline)
- 👁 Click "asignar" en Valentina → campo editable
- ✅ Escribir "1" → Enter → se guarda (API 200)
- 👁 Escape → cancela sin guardar
- ✅ Limpiar mesa (dejar vacío) → queda "asignar"
- [ ] Asignar misma mesa a varios → todos muestran el número

### Panel dietas 🥗
- 👁 Con nadie confirmado → "Sin restricciones"
- 👁 Después de confirmar con dieta → aparece en el panel
- 👁 Acompañante con dieta → también aparece

### Agregar invitado
- [ ] Modal abre correctamente
- ✅ Sin nombre → no guarda (API 400)
- ✅ Con nombre + apellido → guarda (ADMIN y COUPLE)
- [ ] Con email → guarda
- [ ] Sin email → guarda (email opcional)
- [ ] Acompañantes 0 a 5 → selector funciona
- [ ] Nota interna → se guarda, aparece en la fila
- [ ] Cancelar → no guarda nada

### Acciones por fila
- 👁 Click "Link" → copia URL al clipboard (verificar pegando)
- [ ] Click "↗" → abre link en nueva pestaña
- ✅ Click "✕" → elimina (API 200)

### Copiar y usar link
- [ ] Copiar link de Valentina → abrir en incógnito → carga su página personal

---

## 7. REGALOS — Panel novios (/couple/gifts)

- [ ] Lista vacía al inicio → mensaje "Sin regalos todavía"
- ✅ Agregar regalo sin título → no guarda (400)
- ✅ Agregar regalo con título → aparece en lista (201)
- [ ] Agregar con precio, descripción, imagen URL, link de pago → todos se guardan
- ✅ Precio inválido (texto) → no guarda (400)
- ✅ URL de imagen inválida → error (400)
- ✅ URL de pago inválida → error (400)
- ✅ Editar regalo → actualizar → 200
- ✅ Eliminar regalo → 200
- [ ] Regalo con reservas → aparece quién reservó + mensaje
- [ ] Marcar como "Recibido" → badge verde
- [ ] Desmarcar "Recibido" → vuelve al estado anterior

---

## 8. MI CUENTA (/couple/account)

- ✅ Contraseña actual incorrecta → "Contraseña actual incorrecta" (400)
- ✅ Nueva sin mayúscula → 400
- ✅ Nueva sin número → 400
- ✅ Menos de 8 chars → 400
- [ ] Las dos nuevas no coinciden → "Las contraseñas no coinciden"
- 👁 Todo válido → "✓ Contraseña actualizada"
- 👁 Login con nueva contraseña → funciona

---

## 9. PÁGINA DE INVITADO (/i/[token])

### Carga inicial
- ✅ Token válido → muestra nombre del invitado y datos de la boda
- ✅ Token inválido/inventado → 404
- 👁 Con features: RSVP ON + Regalos ON → 2 tabs
- 👁 Con solo RSVP ON → sin tabs, solo formulario
- 👁 Con solo Regalos ON → sin tabs, solo regalos
- 👁 Con ambos OFF → página carga pero sin formulario ni regalos

### Tab RSVP — Valentina (+1)
- 👁 Primera visita → sin respuesta previa, formulario limpio
- 👁 Click "No puedo asistir" → botón activo → click Confirmar → éxito
- 👁 Volver a entrar → muestra "No puedo asistir" seleccionado → cambiar a "Sí, asisto"
- 👁 Con "Sí, asisto": aparece sección acompañantes (hasta 1)
- [ ] Agregar acompañante: nombre + apellido requeridos → sin esto no guarda
- ✅ Agregar acompañante con dieta → guarda (200)
- ✅ Intentar agregar 2do acompañante → bloqueado (400)
- ✅ Dejar mensaje → guarda (200)
- ✅ Actualizar respuesta → 200

### Tab RSVP — Diego (+2)
- ✅ Puede agregar hasta 2 acompañantes (200)
- ✅ Intentar 3ero → bloqueado (400)
- [ ] Cada acompañante tiene su propio campo de dieta

### Tab RSVP — Camila (sin acompañantes)
- ✅ Confirmar → sin sección de acompañantes (200)
- [ ] Solo dieta propia y mensaje

### Tab Regalos
- [ ] Sin regalos cargados → "La lista de regalos está en preparación"
- ✅ Reservar regalo → 200
- ✅ Confirmar sin mensaje → reserva igual (200)
- [ ] Confirmar con mensaje → guarda mensaje
- ✅ "Cancelar reserva" → vuelve al estado original (200)
- [ ] Reservar 2 regalos distintos → ambos se marcan
- [ ] El mismo regalo puede ser reservado por múltiples invitados
- [ ] Contador "X personas ya reservaron" aumenta

### Invitado sin email (Javiera, Ignacio)
- ✅ La página carga igual (200)
- ✅ Puede hacer RSVP (200)
- ✅ No recibe email (no da error — RESEND_API_KEY ausente manejado con gracia)

---

## 10. LANDING PÚBLICA (localhost:3000)

### Visual
- 👁 Fonts: Cormorant Garamond en nombres y títulos, Montserrat en el resto
- 👁 Countdown corre en tiempo real (segundos cambian)
- ✅ Hero: "Florencia & Matias", fecha visible
- 👁 "Ver detalles" scrollea a la sección correcta
- 👁 Sección detalles: Casona San Ignacio, dirección, 15:00 hs
- 👁 Responsive: se ve bien en mobile (Chrome DevTools)

### Sección RSVP (con rsvpEnabled ON)
- ✅ Email de invitado → "Si tu email está registrado..." (no confirma)
- ✅ Email inventado → misma respuesta
- [ ] Email inválido → no envía
- [ ] 3 intentos → rate limit (misma respuesta, no bloquea UI)
- ✅ Con rsvpEnabled OFF → formulario no aparece

### Sección Regalos (con giftsEnabled ON)
- ✅ Regalos cargados → section id="regalos" visible
- 👁 Precio formateado en CLP
- 👁 Click "Reservar" → tooltip "necesitás tu link personal"
- 👁 Tooltip cierra al hacer click afuera
- [ ] "X personas ya lo eligieron" aparece con reservas
- ✅ Con giftsEnabled OFF → sección no aparece

### Footer
- ✅ "· acceso ·" → link presente
- ✅ "@elgarra" → link a GitHub presente

---

## 11. SEGURIDAD

### Control de acceso
- ✅ COUPLE intentando POST /api/admin/users → 401
- ✅ COUPLE intentando GET /api/admin/guests → 200 (misma boda, correcto)
- ✅ COUPLE intentando POST /api/admin/guests/import → 401
- ✅ Sin sesión intentando GET /couple/dashboard → redirige a login
- ✅ Sin sesión intentando GET /admin/dashboard → redirige a login
- ✅ Token de invitado inventado → 404

### No mezcla de contextos
- [ ] Logueado como Florencia, abrir link de Valentina → ve la página de Valentina normalmente
- [ ] Logueado como Florencia, intentar reservar regalo con token de otro invitado → rechazado

### Datos
- ✅ Invitado no puede enviar más acompañantes del máximo (server-side check)
- ✅ Token inválido en reserva de regalo → 404/400

---

## 12. FLUJO COMPLETO E2E

Hacer este flujo de punta a punta:

1. [ ] Login como admin → activar RSVP y Regalos
2. [ ] Entrar como novios → agregar regalo "Contribución luna de miel" $50.000
3. [ ] Abrir link de Valentina → confirmar + 1 acompañante (dieta: vegetariana) + mensaje
4. [ ] Abrir link de Diego → confirmar + 2 acompañantes
5. [ ] Abrir link de Camila → confirmar + reservar el regalo
6. [ ] Abrir link de Tomás → declinar
7. [ ] Volver al panel de Florencia:
   - [ ] Stats: 3 confirmados, 1 no asiste, 6 pendientes
   - [ ] Total personas: 3 + 1 (Valentina) + 2 (Diego) = 6
   - [ ] Panel 🥗: aparece "Valentina Morales — vegetariana"
   - [ ] Panel regalos: Camila aparece como reservante
   - [ ] Marcar regalo de Camila como "Recibido"
8. [ ] Asignar mesa "1" a Valentina y Diego → guardar
9. [ ] Como admin, desactivar Regalos → landing ya no los muestra
10. [ ] Reactivar → todo vuelve
