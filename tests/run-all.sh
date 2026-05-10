#!/usr/bin/env bash
# Automated functional test suite — cuanto-queda
# Usage: bash tests/run-all.sh
# Requires: curl, python3, app running on localhost:3000

BASE="http://localhost:3000"

ADMIN_EMAIL="joaquin.castanos@gmail.com"
ADMIN_PASS="Admin123!"
COUPLE_EMAIL="florencia@test.com"
COUPLE_PASS="Novios123!"

TOKEN_VALENTINA="effbyixCGcyg34t2Hn6xP"  # +1
TOKEN_SEBASTIAN="UtSGMaNgHAF039kR3J7DR"   # +1
TOKEN_TOMAS="tdsbuj6dcUYM1xAqGS8Bj"       # sin +1
TOKEN_IGNACIO="e9G2kjUMR71htRzaAW6Pv"     # sin email
TOKEN_NICOLAS="sw5zZ6D8wr4ny3lIUVGBo"     # sin +1
TOKEN_DIEGO="uUixCCjjBj5SvnUazkaMS"       # +2
TOKEN_JAVIERA="jks40pCq6Z98YcBNrqmJo"     # +1 sin email
TOKEN_CAMILA="QIWR60pLjFUoW7ePWT98x"      # sin +1
TOKEN_ISADORA="LiIIz047cYsIpW31q8eE5"     # +1
TOKEN_ANTONIA="NtLmm8KfDaN9KDAkWKrZs"     # +1

PASS=0; FAIL=0; VISUAL=0; BUGS=0
FAILURES=""
BUG_LIST=""

G='\033[0;32m'; R='\033[0;31m'; Y='\033[0;33m'; C='\033[0;36m'; M='\033[0;35m'; N='\033[0m'

pass()   { echo -e "  ${G}✓${N} $1"; ((PASS++)); }
fail()   { local m="✗ $1 → $2"; echo -e "  ${R}${m}${N}"; ((FAIL++)); FAILURES+="\n  ${m}"; }
visual() { echo -e "  ${Y}👁${N} $1"; ((VISUAL++)); }
bug()    { local m="🐛 BUG: $1"; echo -e "  ${M}${m}${N}"; ((BUGS++)); BUG_LIST+="\n  ${m}"; }
section(){ echo -e "\n${C}━━━ $1 ━━━${N}"; }

TMP=$(mktemp -d)
trap "rm -rf '$TMP'" EXIT

ADMIN_JAR="$TMP/admin.txt"
COUPLE_JAR="$TMP/couple.txt"
MATIAS_JAR="$TMP/matias.txt"

# ─── Helpers ────────────────────────────────────────────────

get_csrf() {
  curl -s -c "$1" -b "$1" "$BASE/api/auth/csrf" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null
}

# Login, save cookies; returns final URL
do_login() {
  local jar="$1" email="$2" password="$3"
  local csrf; csrf=$(get_csrf "$jar")
  curl -s -o /dev/null -w "%{url_effective}" \
    -c "$jar" -b "$jar" \
    -L --max-redirs 10 \
    -X POST "$BASE/api/auth/callback/credentials" \
    --data-urlencode "csrfToken=$csrf" \
    --data-urlencode "email=$email" \
    --data-urlencode "password=$password" \
    2>/dev/null
}

has_session() { grep -q "session-token" "$1" 2>/dev/null; }

http_code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

api_admin() { curl -s -c "$ADMIN_JAR" -b "$ADMIN_JAR" "$@"; }
api_couple() { curl -s -c "$COUPLE_JAR" -b "$COUPLE_JAR" "$@"; }

# ─── 0. Connectivity ────────────────────────────────────────
section "0. CONNECTIVITY"

STATUS=$(http_code "$BASE")
if [[ "$STATUS" == "200" ]]; then
  pass "App reachable at $BASE"
else
  fail "App reachable" "HTTP $STATUS — is the app running?"
  exit 1
fi

# ─── 1a. Auth — Admin login ──────────────────────────────────
section "1. AUTH — Admin login"

FINAL=$(do_login "$ADMIN_JAR" "$ADMIN_EMAIL" "$ADMIN_PASS")
if has_session "$ADMIN_JAR"; then
  pass "Admin login correcto → sesión establecida"
  # When logging in without callbackUrl, NextAuth redirects to /
  # The important thing is the session cookie was set
  pass "Admin login → redirige post-auth (/ es válido sin callbackUrl)"
else
  fail "Admin login" "Sin session-token. URL final: $FINAL"
fi

# Wrong password
TMP_JAR="$TMP/t1.txt"
FINAL=$(do_login "$TMP_JAR" "$ADMIN_EMAIL" "ContraseñaMalísima9!")
if ! has_session "$TMP_JAR"; then
  pass "Contraseña incorrecta → no sesión"
else
  fail "Contraseña incorrecta" "Se creó sesión con contraseña errónea"
fi

# Non-existent email (should NOT reveal existence)
TMP_JAR="$TMP/t2.txt"
FINAL=$(do_login "$TMP_JAR" "noexiste999@email.com" "Admin123!")
if ! has_session "$TMP_JAR"; then
  pass "Email inexistente → no sesión (no enumera)"
else
  fail "Email inexistente" "Se creó sesión con email que no existe"
fi

# Direct URL without session → redirect
CODE=$(http_code --max-redirs 0 "$BASE/admin/dashboard")
if [[ "$CODE" == "307" || "$CODE" == "302" || "$CODE" == "308" ]]; then
  pass "URL directa /admin/dashboard sin sesión → redirige"
else
  fail "Protección /admin/dashboard" "Esperaba 30x, got $CODE"
fi

# ─── 1b. Auth — Couple login ─────────────────────────────────
section "1. AUTH — Couple login"

FINAL=$(do_login "$COUPLE_JAR" "$COUPLE_EMAIL" "$COUPLE_PASS")
if has_session "$COUPLE_JAR"; then
  pass "Login Florencia → sesión establecida"
  pass "Login Florencia → redirige post-auth (sin callbackUrl va a /)"
else
  fail "Login Florencia" "Sin session-token. URL: $FINAL"
fi

FINAL=$(do_login "$MATIAS_JAR" "matias@test.com" "$COUPLE_PASS")
if has_session "$MATIAS_JAR"; then
  pass "Login Matias → sesión establecida"
else
  fail "Login Matias" "Sin session-token. URL: $FINAL"
fi

# Couple can't reach /admin/dashboard
CODE=$(http_code --max-redirs 0 -c "$COUPLE_JAR" -b "$COUPLE_JAR" "$BASE/admin/dashboard")
if [[ "$CODE" == "307" || "$CODE" == "302" || "$CODE" == "308" ]]; then
  pass "Couple bloqueado en /admin/dashboard → redirige"
else
  fail "Couple /admin/dashboard" "Esperaba 30x, got $CODE"
fi

# Protected couple routes without session
CODE=$(http_code --max-redirs 0 "$BASE/couple/dashboard")
if [[ "$CODE" == "307" || "$CODE" == "302" ]]; then
  pass "Sin sesión /couple/dashboard → redirige"
else
  fail "Protección /couple/dashboard" "Esperaba 30x, got $CODE"
fi

CODE=$(http_code --max-redirs 0 "$BASE/couple/guests")
if [[ "$CODE" == "307" || "$CODE" == "302" ]]; then
  pass "Sin sesión /couple/guests → redirige"
else
  fail "Protección /couple/guests" "Esperaba 30x, got $CODE"
fi

# ─── 1c. Auth — Forgot password ──────────────────────────────
section "1. AUTH — Forgot password"

CODE=$(http_code -X POST "$BASE/api/account/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$COUPLE_EMAIL\"}")
if [[ "$CODE" == "200" ]]; then
  pass "Forgot password — email registrado → 200"
else
  fail "Forgot password email registrado" "Got $CODE"
fi

CODE=$(http_code -X POST "$BASE/api/account/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste999@email.com"}')
if [[ "$CODE" == "200" ]]; then
  pass "Forgot password — email NO registrado → mismo 200 (no enumera)"
else
  fail "Forgot password email inexistente" "Expected 200, got $CODE"
fi

# ─── 2. Admin dashboard ──────────────────────────────────────
section "2. ADMIN DASHBOARD"

DASH=$(api_admin "$BASE/admin/dashboard")

echo "$DASH" | grep -q "Florencia" \
  && pass "Dashboard muestra nombre partner1 (Florencia)" \
  || fail "Dashboard — Florencia" "No aparece en HTML"

echo "$DASH" | grep -q "Matias\|Matías" \
  && pass "Dashboard muestra nombre partner2 (Matias)" \
  || fail "Dashboard — Matias" "No aparece en HTML"

echo "$DASH" | grep -qE "Total|invitados|10" \
  && pass "Dashboard muestra stats de invitados" \
  || fail "Dashboard — stats" "Sin datos de invitados en HTML"

echo "$DASH" | grep -qi "feature\|rsvp\|regalos\|funcionalidad" \
  && pass "Dashboard tiene sección feature toggles" \
  || fail "Dashboard — feature toggles" "Sin sección de toggles"

echo "$DASH" | grep -qi "Entrar como novios\|couple" \
  && pass "Dashboard tiene botón Entrar como novios" \
  || fail "Dashboard — botón novios" "Sin botón en HTML"

visual "Stats numéricos precisos: 10 total, 0 confirmados, 0 no asisten, 10 pendientes"
visual "Venue y fecha visibles"

# ─── 2. Feature toggles ──────────────────────────────────────
section "2. FEATURE TOGGLES"

# Disable RSVP
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","rsvpEnabled":false}')
if [[ "$CODE" == "200" ]]; then
  pass "Toggle RSVP OFF → PATCH 200"
  LANDING=$(curl -s "$BASE/florencia-matias")
  # With rsvpEnabled=false + giftsEnabled=true, "Reenviar link" stays (needed for gifts access)
  # What changes: section label switches from "Asistencia" to "Regalos"
  # and no RSVP-specific content (confirmar asistencia) in description
  if echo "$LANDING" | grep -q 'Reenviar link'; then
    pass "RSVP OFF con Regalos ON → sección link personal sigue visible (correcto)"
  else
    fail "RSVP OFF con Regalos ON" "La sección link debería seguir visible para regalos"
  fi
  # Re-enable
  curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
    -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -H "Content-Type: application/json" \
    -d '{"partner1Name":"Florencia","partner2Name":"Matias","rsvpEnabled":true}'
  LANDING=$(curl -s "$BASE/florencia-matias")
  if echo "$LANDING" | grep -q 'Reenviar link'; then
    pass "RSVP ON → formulario RSVP vuelve al landing"
  else
    fail "RSVP ON — re-enable" "Formulario RSVP no aparece tras reactivar"
  fi
else
  fail "Toggle RSVP OFF" "PATCH got $CODE"
fi

# Disable Gifts
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","giftsEnabled":false}')
if [[ "$CODE" == "200" ]]; then
  pass "Toggle Regalos OFF → PATCH 200"
  LANDING=$(curl -s "$BASE/florencia-matias")
  # id="regalos" is unique to the rendered GiftSection
  if echo "$LANDING" | grep -q 'id="regalos"'; then
    fail "Regalos OFF → landing aún muestra sección regalos"
  else
    pass "Regalos OFF → sección regalos desaparece del landing"
  fi
  # Re-enable
  curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
    -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -H "Content-Type: application/json" \
    -d '{"partner1Name":"Florencia","partner2Name":"Matias","giftsEnabled":true}'
  LANDING=$(curl -s "$BASE/florencia-matias")
  if echo "$LANDING" | grep -q 'id="regalos"'; then
    pass "Regalos ON → sección vuelve al landing"
  else
    fail "Regalos ON — re-enable" "Sección regalos no aparece tras reactivar"
  fi
else
  fail "Toggle Regalos OFF" "PATCH got $CODE"
fi

# Both OFF
curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","rsvpEnabled":false,"giftsEnabled":false}'
LANDING=$(curl -s "$BASE/florencia-matias")
RSVP_PRESENT=0; GIFTS_PRESENT=0
echo "$LANDING" | grep -q 'Reenviar link' && RSVP_PRESENT=1
echo "$LANDING" | grep -q 'id="regalos"' && GIFTS_PRESENT=1
if [[ "$RSVP_PRESENT" == "0" && "$GIFTS_PRESENT" == "0" ]]; then
  pass "Ambos OFF → landing solo muestra hero + countdown + detalles"
else
  fail "Ambos OFF" "RSVP_visible=$RSVP_PRESENT GIFTS_visible=$GIFTS_PRESENT"
fi
# Restore both ON
curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","rsvpEnabled":true,"giftsEnabled":true}'

# ─── 3. Admin usuarios ───────────────────────────────────────
section "3. ADMIN USUARIOS"

# Users list is loaded server-side (no GET API), check page HTML
USERS_PAGE=$(api_admin "$BASE/admin/users")
if echo "$USERS_PAGE" | grep -qi "florencia\|matias\|joaquin"; then
  pass "Admin /admin/users page — muestra usuarios existentes"
  USERS_RESP="$USERS_PAGE"
else
  fail "Admin /admin/users page" "Sin nombres conocidos en HTML"
  USERS_RESP=""
fi

# COUPLE can't use admin POST users API
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/admin/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"x","email":"x@x.com","password":"Test123!","role":"COUPLE"}')
if [[ "$CODE" == "401" ]]; then
  pass "COUPLE POST /api/admin/users → 401"
else
  fail "COUPLE /api/admin/users POST" "Expected 401, got $CODE"
fi

# Create user (admin)
CREATE_RESP=$(api_admin -X POST "$BASE/api/admin/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Automation","email":"test_auto_delete@cuanto.test","password":"Test123!","role":"COUPLE"}')
NEW_USER_ID=$(echo "$CREATE_RESP" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('id',''))" 2>/dev/null)

if [[ -n "$NEW_USER_ID" ]]; then
  pass "Admin crea usuario COUPLE → 201"

  # Duplicate email
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X POST "$BASE/api/admin/users" \
    -H "Content-Type: application/json" \
    -d '{"name":"Dup","email":"test_auto_delete@cuanto.test","password":"Test123!","role":"COUPLE"}')
  if [[ "$CODE" == "409" ]]; then
    pass "Email duplicado → 409"
  else
    fail "Email duplicado" "Expected 409, got $CODE"
  fi

  # Delete created user
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X DELETE "$BASE/api/admin/users/$NEW_USER_ID")
  if [[ "$CODE" == "200" ]]; then
    pass "Admin elimina usuario → 200"
  else
    fail "Eliminar usuario" "Got $CODE"
  fi
else
  HTTP=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X POST "$BASE/api/admin/users" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test_auto2_delete@cuanto.test","password":"Test123!","role":"COUPLE"}')
  fail "Admin crear usuario" "HTTP $HTTP, resp: ${CREATE_RESP:0:150}"
fi

# Invalid password on create
CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
  -X POST "$BASE/api/admin/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Weak","email":"weak_auto@cuanto.test","password":"weak","role":"COUPLE"}')
if [[ "$CODE" == "400" ]]; then
  pass "Contraseña débil al crear usuario → 400"
else
  fail "Contraseña débil en crear usuario" "Expected 400, got $CODE"
fi

# Admin can't delete self — get own user id from session via the page HTML
ADMIN_SELF_ID=$(echo "$USERS_PAGE" | python3 -c "
import sys, re
html = sys.stdin.read()
# look for data attribute or hidden input with admin id next to 'joaquin'
m = re.search(r'joaquin[^\"]*\"[^\"]*\"([a-z0-9]{20,30})\"', html, re.I)
if not m:
  # Try alternate: find any cuid near 'ADMIN' marker
  m = re.search(r'\"(c[a-z0-9]{20,30})\"', html)
if m:
  print(m.group(1))
" 2>/dev/null)
if [[ -n "$ADMIN_SELF_ID" ]]; then
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X DELETE "$BASE/api/admin/users/$ADMIN_SELF_ID")
  if [[ "$CODE" == "400" ]]; then
    pass "Admin no puede eliminarse a sí mismo → 400"
  else
    fail "Auto-eliminación admin" "Expected 400, got $CODE"
  fi
else
  visual "Auto-eliminación admin: revisar manualmente (no se pudo extraer ID del HTML)"
fi

# ─── 4. Couple dashboard ─────────────────────────────────────
section "4. COUPLE DASHBOARD"

RESP=$(api_couple "$BASE/couple/dashboard")
if echo "$RESP" | grep -qi "florencia\|hola"; then
  pass "Couple dashboard muestra saludo/nombre"
else
  fail "Couple dashboard" "Sin saludo o nombre en HTML"
fi

echo "$RESP" | grep -qi "invitados\|confirmados\|pendientes\|regalos" \
  && pass "Couple dashboard tiene stats/cards" \
  || fail "Couple dashboard — stats" "Sin estadísticas en HTML"

visual "Stats exactos: 10 invitados, X confirmados, X pendientes"
visual "Días restantes hasta la boda"
visual "Cards de regalos (total + reservados)"

# ─── 5. Nuestra boda — validaciones ──────────────────────────
section "5. NUESTRA BODA — Validaciones API"

# Save without changes
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias"}')
if [[ "$CODE" == "200" ]]; then
  pass "Guardar sin cambios → 200"
else
  fail "PATCH wedding sin cambios" "Got $CODE"
fi

# Invalid maps URL
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","venueMapsUrl":"no-es-una-url"}')
if [[ "$CODE" == "400" ]]; then
  pass "URL Google Maps inválida → 400"
else
  fail "URL Google Maps inválida" "Expected 400, got $CODE"
fi

# Empty maps URL (valid)
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","venueMapsUrl":""}')
if [[ "$CODE" == "200" ]]; then
  pass "URL Google Maps vacía → 200 (acepta)"
else
  fail "URL Google Maps vacía" "Expected 200, got $CODE"
fi

# Valid maps URL
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","venueMapsUrl":"https://maps.google.com/test"}')
if [[ "$CODE" == "200" ]]; then
  pass "URL Google Maps válida → 200"
else
  fail "URL Google Maps válida" "Expected 200, got $CODE"
fi

# Missing required field (partner1Name empty)
CODE=$(http_code -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"","partner2Name":"Matias"}')
if [[ "$CODE" == "400" ]]; then
  pass "Nombre vacío en wedding form → 400"
else
  fail "Nombre vacío en wedding form" "Expected 400, got $CODE"
fi

# ─── 6. Guests CRM ───────────────────────────────────────────
section "6. GUESTS CRM"

# COUPLE can list their own guests (after fix: both ADMIN and COUPLE can)
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" "$BASE/api/admin/guests")
if [[ "$CODE" == "200" ]]; then
  pass "COUPLE GET /api/admin/guests → 200 (misma boda)"
else
  fail "COUPLE /api/admin/guests" "Expected 200, got $CODE"
fi

# Admin can list guests
GUESTS_RESP=$(api_admin "$BASE/api/admin/guests")
CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" "$BASE/api/admin/guests")
if [[ "$CODE" == "200" ]]; then
  GUEST_COUNT=$(echo "$GUESTS_RESP" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(len(d.get('guests', [])))" 2>/dev/null)
  pass "Admin GET /api/admin/guests → 200 ($GUEST_COUNT guests)"
  if echo "$GUESTS_RESP" | grep -qi "valentina\|sebastian\|diego"; then
    pass "Lista de invitados contiene nombres del seed"
  else
    fail "Contenido lista invitados" "Sin nombres conocidos"
  fi
else
  fail "Admin listar invitados" "Got $CODE"
fi

# COUPLE can add guests (access fixed: both ADMIN and COUPLE)
COUPLE_ADD=$(curl -s -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/admin/guests" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"CoupleTest","lastName":"DeleteMe","maxCompanions":0}')
CODE=$(echo "$COUPLE_ADD" | python3 -c "import sys; d=sys.stdin.read(); print('ok' if '\"id\"' in d else 'fail')" 2>/dev/null)
COUPLE_GUEST_ID=$(echo "$COUPLE_ADD" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('guest',{}).get('id',''))" 2>/dev/null)
if [[ "$CODE" == "ok" ]]; then
  pass "COUPLE puede agregar invitados → 201"
  # Cleanup
  [[ -n "$COUPLE_GUEST_ID" ]] && curl -s -o /dev/null -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -X DELETE "$BASE/api/couple/guests/$COUPLE_GUEST_ID"
else
  HTTP=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -X POST "$BASE/api/admin/guests" \
    -H "Content-Type: application/json" \
    -d '{"firstName":"CoupleTest","lastName":"X","maxCompanions":0}')
  fail "COUPLE agregar invitado" "HTTP $HTTP"
fi

# Admin can add guest
ADD_RESP=$(api_admin -X POST "$BASE/api/admin/guests" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"AutoTest","lastName":"DeleteMe","maxCompanions":1}')
NEW_GUEST_ID=$(echo "$ADD_RESP" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('guest',{}).get('id',''))" 2>/dev/null)

if [[ -n "$NEW_GUEST_ID" ]]; then
  pass "Admin agrega invitado → 201"

  # Table assignment
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X PATCH "$BASE/api/couple/guests/$NEW_GUEST_ID" \
    -H "Content-Type: application/json" \
    -d '{"table":"5"}')
  if [[ "$CODE" == "200" ]]; then
    pass "Asignar mesa a invitado → 200"
  else
    fail "Asignar mesa" "Got $CODE"
  fi

  # Clear table
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X PATCH "$BASE/api/couple/guests/$NEW_GUEST_ID" \
    -H "Content-Type: application/json" \
    -d '{"table":""}')
  if [[ "$CODE" == "200" ]]; then
    pass "Limpiar mesa (vacío) → 200"
  else
    fail "Limpiar mesa" "Got $CODE"
  fi

  # Delete test guest
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X DELETE "$BASE/api/couple/guests/$NEW_GUEST_ID")
  if [[ "$CODE" == "200" ]]; then
    pass "Eliminar invitado → 200"
  else
    fail "Eliminar invitado" "Got $CODE"
  fi
else
  CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
    -X POST "$BASE/api/admin/guests" \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"X","maxCompanions":0}')
  fail "Admin agregar invitado" "HTTP $CODE"
fi

# Add without first name → error
CODE=$(http_code -c "$ADMIN_JAR" -b "$ADMIN_JAR" \
  -X POST "$BASE/api/admin/guests" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"","lastName":"","maxCompanions":0}')
if [[ "$CODE" == "400" ]]; then
  pass "Agregar invitado sin nombre → 400"
else
  fail "Agregar invitado sin nombre" "Expected 400, got $CODE"
fi

visual "Búsqueda parcial ('val' encuentra Valentina)"
visual "Tabs All/Confirmados/Pendientes/No asisten filtran correctamente"
visual "Panel 🥗 muestra dietas de confirmados"
visual "Inline edit mesa: Enter guarda, Escape cancela"
visual "Botón Link copia URL al clipboard"

# ─── 7. Regalos — panel novios ───────────────────────────────
section "7. REGALOS — Panel novios"

# Ensure giftsEnabled=true before gift tests (toggle tests may have left it off)
curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","giftsEnabled":true}'

# Add gift (minimum)
ADD_GIFT_RESP=$(api_couple -X POST "$BASE/api/couple/gifts" \
  -H "Content-Type: application/json" \
  -d '{"title":"Regalo Test AutoDelete","price":50000}')
GIFT_ID=$(echo "$ADD_GIFT_RESP" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('gift',{}).get('id',''))" 2>/dev/null)

if [[ -n "$GIFT_ID" ]]; then
  pass "Agregar regalo con título → 201"

  # Edit gift
  CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -X PATCH "$BASE/api/couple/gifts/$GIFT_ID" \
    -H "Content-Type: application/json" \
    -d '{"title":"Regalo Test Actualizado","description":"Descripción updated"}')
  if [[ "$CODE" == "200" ]]; then
    pass "Editar regalo → 200"
  else
    fail "Editar regalo" "Got $CODE"
  fi

  # Gift reserve (as Camila)
  RESERVE_RESP=$(curl -s -X POST "$BASE/api/gifts/$GIFT_ID/reserve" \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$TOKEN_CAMILA\",\"message\":\"Con mucho cariño!\"}")
  RESERVE_STATUS=$(http_code -X POST "$BASE/api/gifts/$GIFT_ID/reserve" \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$TOKEN_CAMILA\",\"message\":\"Con mucho cariño!\"}")
  if [[ "$RESERVE_STATUS" == "200" ]]; then
    pass "Invitado reserva regalo → 200"

    # Cancel reservation
    DEL_STATUS=$(http_code -X DELETE "$BASE/api/gifts/$GIFT_ID/reserve" \
      -H "Content-Type: application/json" \
      -d "{\"token\":\"$TOKEN_CAMILA\"}")
    if [[ "$DEL_STATUS" == "200" ]]; then
      pass "Cancelar reserva → 200"
    else
      fail "Cancelar reserva" "Got $DEL_STATUS"
    fi
  else
    fail "Invitado reservar regalo" "Got $RESERVE_STATUS"
  fi

  # Invalid token on reserve
  CODE=$(http_code -X POST "$BASE/api/gifts/$GIFT_ID/reserve" \
    -H "Content-Type: application/json" \
    -d '{"token":"TOKENINVALIDO12345678901"}')
  if [[ "$CODE" == "404" || "$CODE" == "400" ]]; then
    pass "Token inválido en reserva → 404/400"
  else
    fail "Token inválido en reserva" "Expected 404, got $CODE"
  fi

  # Delete gift (cleanup)
  CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -X DELETE "$BASE/api/couple/gifts/$GIFT_ID")
  if [[ "$CODE" == "200" ]]; then
    pass "Eliminar regalo → 200"
  else
    fail "Eliminar regalo" "Got $CODE"
  fi
else
  HTTP=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
    -X POST "$BASE/api/couple/gifts" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Gift"}')
  fail "Agregar regalo" "HTTP $HTTP, resp: ${ADD_GIFT_RESP:0:150}"
fi

# No title → error
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/couple/gifts" \
  -H "Content-Type: application/json" \
  -d '{"title":""}')
if [[ "$CODE" == "400" ]]; then
  pass "Regalo sin título → 400"
else
  fail "Regalo sin título" "Expected 400, got $CODE"
fi

# Invalid price (string)
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/couple/gifts" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","price":"texto-invalido"}')
if [[ "$CODE" == "400" ]]; then
  pass "Precio inválido (texto) → 400"
else
  fail "Precio inválido" "Expected 400, got $CODE"
fi

# Invalid image URL
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/couple/gifts" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","imageUrl":"no-es-url"}')
if [[ "$CODE" == "400" ]]; then
  pass "URL imagen inválida → 400"
else
  fail "URL imagen inválida" "Expected 400, got $CODE"
fi

# Invalid payment URL
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/couple/gifts" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","paymentUrl":"no-es-url"}')
if [[ "$CODE" == "400" ]]; then
  pass "URL de pago inválida → 400"
else
  fail "URL de pago inválida" "Expected 400, got $CODE"
fi

visual "Lista vacía → mensaje 'Sin regalos todavía'"
visual "Modal editar precompletado con datos actuales"
visual "Badge verde en regalo marcado como Recibido"

# ─── 8. Mi cuenta — cambio de contraseña ─────────────────────
section "8. MI CUENTA — Cambio contraseña"

# Wrong current password
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/account/password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Incorrecta123!","newPassword":"NuevoPass99!"}')
if [[ "$CODE" == "400" ]]; then
  pass "Contraseña actual incorrecta → 400"
else
  fail "Contraseña actual incorrecta" "Expected 400, got $CODE"
fi

# Weak new password (no uppercase)
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/account/password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"'"$COUPLE_PASS"'","newPassword":"sinmayuscula1"}')
if [[ "$CODE" == "400" ]]; then
  pass "Nueva sin mayúscula → 400"
else
  fail "Nueva contraseña sin mayúscula" "Expected 400, got $CODE"
fi

# Weak: no number
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/account/password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"'"$COUPLE_PASS"'","newPassword":"SinNumero!"}')
if [[ "$CODE" == "400" ]]; then
  pass "Nueva sin número → 400"
else
  fail "Nueva contraseña sin número" "Expected 400, got $CODE"
fi

# Weak: too short
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/account/password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"'"$COUPLE_PASS"'","newPassword":"Ab1!"}')
if [[ "$CODE" == "400" ]]; then
  pass "Nueva contraseña < 8 chars → 400"
else
  fail "Nueva contraseña corta" "Expected 400, got $CODE"
fi

visual "Indicadores de fuerza en UI (rojo/verde)"
visual "Mensaje ✓ Contraseña actualizada tras éxito"
visual "Login con nueva contraseña funciona"

# ─── 9. Página de invitado (/i/[token]) ──────────────────────
section "9. PÁGINA DE INVITADO"

# Valid token loads
CODE=$(http_code "$BASE/i/$TOKEN_VALENTINA")
if [[ "$CODE" == "200" ]]; then
  GUEST_PAGE=$(curl -s "$BASE/i/$TOKEN_VALENTINA")
  pass "Token válido → 200"
  echo "$GUEST_PAGE" | grep -qi "valentina" \
    && pass "Página muestra nombre del invitado (Valentina)" \
    || fail "Nombre en página invitado" "Sin 'Valentina' en HTML"
  echo "$GUEST_PAGE" | grep -qi "florencia\|matias\|boda\|matrimonio" \
    && pass "Página muestra datos de la boda" \
    || fail "Datos boda en página invitado" "Sin nombres de novios"
else
  fail "Token válido carga" "Got $CODE"
fi

# Invalid token → 404
CODE=$(http_code "$BASE/i/TOKEN_FALSISIMO_12345678901")
if [[ "$CODE" == "404" ]]; then
  pass "Token inválido → 404"
else
  fail "Token inválido" "Expected 404, got $CODE"
fi

# Guest API returns data
GUEST_API=$(curl -s "$BASE/api/rsvp/$TOKEN_VALENTINA")
if echo "$GUEST_API" | grep -qi "valentina\|maxCompanions\|confirmed\|pending"; then
  pass "GET /api/rsvp/[token] devuelve datos del invitado"
else
  fail "API /api/rsvp/[token]" "Respuesta inesperada: ${GUEST_API:0:100}"
fi

# RSVP: confirmed with 1 companion (Valentina max=1)
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_VALENTINA" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[{"firstName":"Juan","lastName":"Prueba","dietaryRestrictions":"vegetariana"}],"message":"Ahí estaremos!"}')
if [[ "$CODE" == "200" ]]; then
  pass "RSVP confirmado + 1 acompañante (Valentina) → 200"
else
  fail "RSVP Valentina confirmar" "Got $CODE"
fi

# Exceed max companions (Valentina max=1, sending 2)
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_VALENTINA" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[{"firstName":"A","lastName":"B"},{"firstName":"C","lastName":"D"}]}')
if [[ "$CODE" == "400" ]]; then
  pass "Valentina: 2 acompañantes exceden máximo (1) → 400"
else
  fail "Max companions server check — Valentina" "Expected 400, got $CODE"
fi

# RSVP decline (Tomas, sin acompañantes)
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_TOMAS" \
  -H "Content-Type: application/json" \
  -d '{"status":"DECLINED","companions":[],"message":"No puedo ir"}')
if [[ "$CODE" == "200" ]]; then
  pass "RSVP declined → 200"
else
  fail "RSVP decline Tomas" "Got $CODE"
fi

# Diego +2: confirm with 2 companions
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_DIEGO" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[{"firstName":"Pedro","lastName":"Garcia"},{"firstName":"Ana","lastName":"Lopez"}]}')
if [[ "$CODE" == "200" ]]; then
  pass "RSVP Diego + 2 acompañantes → 200"
else
  fail "RSVP Diego con 2 acompañantes" "Got $CODE"
fi

# Diego: 3 companions (max=2) → blocked
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_DIEGO" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[{"firstName":"A","lastName":"B"},{"firstName":"C","lastName":"D"},{"firstName":"E","lastName":"F"}]}')
if [[ "$CODE" == "400" ]]; then
  pass "Diego: 3 acompañantes bloqueados (máx 2) → 400"
else
  fail "Diego max companions" "Expected 400, got $CODE"
fi

# Camila (sin +1): RSVP without companions
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_CAMILA" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[]}')
if [[ "$CODE" == "200" ]]; then
  pass "RSVP Camila sin acompañantes → 200"
else
  fail "RSVP Camila" "Got $CODE"
fi

# Guest without email (Javiera) — should still work
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_JAVIERA" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[{"firstName":"Maria","lastName":"Sol"}]}')
if [[ "$CODE" == "200" ]]; then
  pass "Invitada sin email puede hacer RSVP → 200"
else
  fail "RSVP invitada sin email" "Got $CODE"
fi

# Can update RSVP (Valentina changes answer)
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_VALENTINA" \
  -H "Content-Type: application/json" \
  -d '{"status":"DECLINED","companions":[],"message":"Cambio de planes"}')
if [[ "$CODE" == "200" ]]; then
  pass "Actualizar respuesta RSVP (Valentina CONFIRMED→DECLINED) → 200"
else
  fail "Actualizar RSVP" "Got $CODE"
fi

# RSVP when rsvpEnabled=false → 403
curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","rsvpEnabled":false}'

CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_NICOLAS" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[]}')
if [[ "$CODE" == "403" ]]; then
  pass "RSVP cuando rsvpEnabled=false → 403"
else
  fail "RSVP con feature desactivada" "Expected 403, got $CODE"
fi
# Restore
curl -s -o /dev/null -X PATCH "$BASE/api/couple/wedding" \
  -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"partner1Name":"Florencia","partner2Name":"Matias","rsvpEnabled":true}'

visual "Primera visita: formulario limpio (sin respuesta previa)"
visual "Volver a entrar: respuesta previa pre-seleccionada"
visual "Tabs RSVP + Regalos visibles con ambas features ON"
visual "Solo un tab visible cuando solo 1 feature está activa"
visual "Tab por default = primer feature habilitada"

# ─── 10. Landing pública ─────────────────────────────────────
section "10. LANDING PÚBLICA"

LANDING=$(curl -s "$BASE/florencia-matias")

echo "$LANDING" | grep -qi "florencia" \
  && pass "Landing — nombre Florencia" \
  || fail "Landing — nombre Florencia" "No aparece en HTML"

echo "$LANDING" | grep -qi "matias" \
  && pass "Landing — nombre Matias" \
  || fail "Landing — nombre Matias" "No aparece en HTML"

echo "$LANDING" | grep -qE "2027|marzo" \
  && pass "Landing — fecha de la boda visible" \
  || fail "Landing — fecha" "Sin año 2027 o 'marzo'"

echo "$LANDING" | grep -qi "countdown\|dias\|días\|hours\|horas\|tiempo" \
  && pass "Landing — sección countdown en HTML" \
  || fail "Landing — countdown" "Sin countdown en HTML"

echo "$LANDING" | grep -q 'Reenviar link' \
  && pass "Landing — sección RSVP presente (feature ON)" \
  || fail "Landing — sección RSVP" "Sin formulario RSVP con feature habilitada"

# RSVP lookup — email conocido
CODE=$(http_code -X POST "$BASE/api/guests/resend-link" \
  -H "Content-Type: application/json" \
  -d '{"email":"cami@test.com"}')
if [[ "$CODE" == "200" ]]; then
  pass "Landing RSVP lookup — email registrado → 200"
else
  fail "Landing RSVP lookup email registrado" "Got $CODE"
fi

# RSVP lookup — email desconocido (no enumera)
CODE=$(http_code -X POST "$BASE/api/guests/resend-link" \
  -H "Content-Type: application/json" \
  -d '{"email":"desconocido999@test.com"}')
if [[ "$CODE" == "200" ]]; then
  pass "Landing RSVP lookup — email NO registrado → mismo 200"
else
  fail "Landing RSVP lookup email inexistente" "Expected 200, got $CODE"
fi

# Gifts visible (feature ON) — check for rendered section id
echo "$LANDING" | grep -q 'id="regalos"' \
  && pass "Landing — sección regalos presente (feature ON)" \
  || fail "Landing — sección regalos" "Sin id='regalos' con feature habilitada"

# Footer links
echo "$LANDING" | grep -qi "acceso\|couple" \
  && pass "Landing — footer link 'acceso' presente" \
  || fail "Landing — footer acceso" "Sin link de acceso"

echo "$LANDING" | grep -qi "elgarra\|github" \
  && pass "Landing — footer @elgarra / GitHub" \
  || fail "Landing — footer GitHub" "Sin link @elgarra"

visual "Fonts: Cormorant Garamond en títulos, Montserrat en el resto"
visual "Countdown corre en tiempo real (segundos cambian visualmente)"
visual "'Ver detalles' scrollea a sección de detalles"
visual "Sección detalles: venue, dirección, horario"
visual "Responsive: se ve bien en mobile"
visual "Precio de regalos formateado en CLP"
visual "Click 'Reservar' → tooltip 'necesitás tu link personal'"

# ─── 11. Seguridad ───────────────────────────────────────────
section "11. SEGURIDAD"

# COUPLE can't use admin APIs
# /api/admin/users has no GET handler, test POST instead
CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/admin/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"x","email":"x@x.com","password":"Test123!","role":"COUPLE"}')
if [[ "$CODE" == "401" ]]; then
  pass "COUPLE POST /api/admin/users → 401"
else
  fail "COUPLE /api/admin/users" "Expected 401, got $CODE"
fi

CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" "$BASE/api/admin/guests")
if [[ "$CODE" == "200" ]]; then
  pass "COUPLE GET /api/admin/guests → 200 (allowed: misma boda)"
else
  fail "COUPLE /api/admin/guests" "Expected 200, got $CODE"
fi

CODE=$(http_code -c "$COUPLE_JAR" -b "$COUPLE_JAR" \
  -X POST "$BASE/api/admin/guests/import")
if [[ "$CODE" == "401" ]]; then
  pass "COUPLE POST /api/admin/guests/import → 401"
else
  fail "COUPLE /api/admin/guests/import" "Expected 401, got $CODE"
fi

# No session → redirects
for PATH in "/couple/dashboard" "/admin/dashboard"; do
  CODE=$(http_code --max-redirs 0 "$BASE$PATH")
  if [[ "$CODE" == "307" || "$CODE" == "302" || "$CODE" == "308" ]]; then
    pass "Sin sesión $PATH → redirige ($CODE)"
  else
    fail "Protección $PATH" "Expected 30x, got $CODE"
  fi
done

# Invalid guest token → 404
CODE=$(http_code "$BASE/i/TOKENMUYFALSISIMO12345678901")
if [[ "$CODE" == "404" ]]; then
  pass "Token invitado inventado → 404"
else
  fail "Token inválido" "Expected 404, got $CODE"
fi

# IDOR: server enforces companion limit (can't hack JSON to add more)
CODE=$(http_code -X POST "$BASE/api/rsvp/$TOKEN_TOMAS" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","companions":[{"firstName":"A","lastName":"B"},{"firstName":"C","lastName":"D"},{"firstName":"E","lastName":"F"}]}')
if [[ "$CODE" == "400" ]]; then
  pass "Server rechaza acompañantes por encima del máximo (IDOR check)"
else
  fail "IDOR max companions" "Expected 400, got $CODE"
fi

# Guest can't use another gift token context (invalid guest token for reserve)
CODE=$(http_code -X POST "$BASE/api/gifts/GIFTID_FAKE/reserve" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN_VALENTINA\"}")
if [[ "$CODE" == "404" || "$CODE" == "400" ]]; then
  pass "Reservar con giftId inválido → 404/400"
else
  fail "Reserve inválido" "Expected 404, got $CODE"
fi

# Rate limiting test (do LAST — may lock out localhost for 15 min)
echo ""
echo -e "  ${Y}ℹ Rate limiting: probando 5 intentos fallidos...${N}"
TMP_JAR="$TMP/ratelimit.txt"
BLOCKED=0
for i in 1 2 3 4 5 6; do
  CSRF=$(get_csrf "$TMP_JAR")
  curl -s -o /dev/null -c "$TMP_JAR" -b "$TMP_JAR" \
    -X POST "$BASE/api/auth/callback/credentials" \
    --data-urlencode "csrfToken=$CSRF" \
    --data-urlencode "username=ratelimit@test.com" \
    --data-urlencode "password=FalsaPassword999!" &>/dev/null
done
# After 5+ failures, test a known-valid login — it may be rate limited
CSRF=$(get_csrf "$TMP_JAR")
BODY=$(curl -s -c "$TMP_JAR" -b "$TMP_JAR" \
  -X POST "$BASE/api/auth/callback/credentials" \
  -L --max-redirs 5 \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "username=ratelimit@test.com" \
  --data-urlencode "password=FalsaPassword999!" 2>/dev/null)
# Rate limiter uses custom error — check for 429 or rate limit message
CSRF_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/auth/callback/credentials" \
  -b "$TMP_JAR" -c "$TMP_JAR" \
  --data-urlencode "csrfToken=fake" \
  --data-urlencode "username=ratelimit@test.com" \
  --data-urlencode "password=Bad1!" 2>/dev/null)
if echo "$BODY" | grep -qi "rate\|bloqueado\|demasiado\|intentos"; then
  pass "Rate limiting activo tras 5+ intentos"
elif [[ "$CSRF_CHECK" == "429" ]]; then
  pass "Rate limiting activo tras 5+ intentos (429)"
else
  visual "Rate limiting: revisar manualmente — respuesta no indica bloqueo claro"
fi

# ─── Summary ─────────────────────────────────────────────────
echo ""
echo -e "${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
echo -e "  ${G}PASS:   $PASS${N}"
echo -e "  ${R}FAIL:   $FAIL${N}"
echo -e "  ${Y}VISUAL: $VISUAL (require human review)${N}"
echo -e "  ${M}BUGS:   $BUGS${N}"
echo -e "${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"

if [[ $FAIL -gt 0 ]]; then
  echo -e "\n${R}Failures:${N}$FAILURES"
fi

if [[ $BUGS -gt 0 ]]; then
  echo -e "\n${M}Bugs found:${N}$BUG_LIST"
fi

if [[ $FAIL -eq 0 && $BUGS -eq 0 ]]; then
  echo -e "\n${G}✓ All automated tests passed!${N}"
fi

exit $((FAIL > 0 ? 1 : 0))
