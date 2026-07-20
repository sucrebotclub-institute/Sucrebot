---
name: sucrebot-development
description: Use this skill when working on SucreBot, the robotics competition management platform for Instituto Superior Universitario Sucre. Triggers include requests to modify SucreBot pages (INICIO, REGISTRO, REGISTRO-DEV, MI-REGISTRO, PARTICIPANTES_REGISTRADOS, ESC-NER, CRONOMETRO, INSECTOS, PANEL-CALIFICACION, PANEL-BRACKET, PANTALLA, RESULTADOS, CERTIFICADOS, GENERAR-CERTIFICADOS, MANILLAS, FAQ, REGLAMENTO, INSTITUCION), fix bugs in registration/scanner/timing/results/certificate/scoring/bracket/manillas/insectos systems, update Google Apps Script backend, adjust UI styling (institutional blue #1a5ca8, Bebas Neue/Exo 2/Orbitron/DM Mono fonts), integrate with Google Sheets/Google Drive APIs, work with the staff-token auth system, troubleshoot QR scanning/category locking/Web Serial/bracket issues, or write console test/cleanup scripts.
---

# SucreBot Development Skill (actualizado 19-jul-2026)

## Project Overview

SucreBot is a full-stack web platform for managing robotics competition events, developed as a thesis project for Instituto Superior Universitario Sucre / Club de Robótica Sucre. Hosted on GitHub Pages at `sucrebotclub-institute.github.io`.

The platform manages the full competition lifecycle: participant registration → staff approval → QR-based check-in → live timing/scoring/combat across multiple categories → bracket management → ranked results → diploma generation → wristband delivery.

**Event date: July 16, 2026**

**Repo:** `sucrebotclub-institute/Sucrebot` (branch `main`). Note: the home page lives at `INICIO/index.html`, NOT at repo root `index.html`.

---

## Technical Stack

### Frontend
- **Hosting**: GitHub Pages (`sucrebotclub-institute/Sucrebot` repo)
- **Architecture**: Modular pages with shared components loaded via `data-include` attributes
- **Auth**: Shared staff token stored in `localStorage` (`SucreBot2026-CMI-Sucre-x7k9mQ`)
- **Shared CSS**: `../shared/css/styles.css` + `../shared/css/mobile-fix.css`
- **Shared JS**:
  - `../shared/js/config.js` — centralizes `CONFIG.GAS_URL()` (**load in `<head>`**)
  - `../shared/js/auth.js` — staff token session handling (`activarSesion`, `cerrarSesion`, `cambiarCuenta`). Reserved localStorage keys: `sucrebot_user`, `sucrebot_staff_token` — **never clear these in generic cache-clear scripts**
  - `../shared/js/load-components.js` — component loader, dispatches `componentsLoaded` event (dynamic path detection)
  - `../shared/js/certificados.js` — certificate HTML, PDF generation, Drive upload

### Backend & Services
- **Backend**: Google Apps Script (`Code.gs`)
  - **⚠️ CORS fix**: always use `Content-Type: text/plain;charset=utf-8` in fetch POST calls, NOT `application/json`
  - After any GAS deploy → update `config.js` `DEPLOYMENT_ID` and commit to GitHub
  - **⚠️ NEVER commit Code.gs to GitHub** — contains `GITHUB_TOKEN` secret. Edit only in script.google.com
  - **⚠️ GAS syntax errors are silent** — a stray `Logger.log` outside any function causes silent deployment failures. Always validate structure before deploying

### Staff Token
```js
const STAFF_TOKEN = 'SucreBot2026-CMI-Sucre-x7k9mQ';
// All gasPost calls MUST include staffToken (except ACCIONES_PUBLICAS)
```
**ACCIONES_PUBLICAS** (no token required): `setParticipante`, `uploadComprobante`, `uploadLogo`

### ⚠️ DEPRECADO / Legacy
- **EmailJS** — eliminado mayo 2026
- **ImgBB** — eliminado mayo 2026. Todo upload va a Google Drive vía GAS
- **ESCANER-SOCCER / CRONOMETRO-SOCCER** — eliminados junio 2026. Soccer usa PANEL-BRACKET
- **getEquiposSoccer / equipos_soccer / bracket_soccer** — legacy. Soccer migró a hoja `soccer_torneo`
- **Google OAuth / STAFF_EMAILS en config.js** — reemplazado por staff token compartido
- **Batalla en PANEL-CALIFICACION** — eliminado 21 jun 2026. Batalla migró a PANEL-BRACKET
- **Soccer en bracket_general** — eliminado 22 jun 2026. Soccer tiene hoja `soccer_torneo` propia

---

## CATEGORIA_MAP (GAS constant)

```js
const CATEGORIA_MAP = {
  'Insectos':                         'ins',
  'Trepador (Amateur)':               'trp_a',
  'Seguidor de línea ST (Amateur)':   'sl_a',
  'Seguidor de línea ST (Pro)':       'sl_p',
  'Minisumo Autónomo':                'ms_a',
  'Minisumo RC':                      'ms_rc',
  'Bailarín':                         'bai',
  'Batalla':                          'bat',
  'Impacto Tecnológico':              'dev',
  'Trepador (Pro)':                   'trp_p',
  'Robot soccer':                     'soc',
  'Cubo Rubik':                       'cr',
  'Lego Kids':                        'lk'
};
```

---

## Google Sheets — Tabs

| Tab | Cols | Notes |
|---|---|---|
| `participantes` | 17 | id, nombre, institucion, ciudad, robot, contacto, correo, categoria, archivoUrl, aprobado, razonRechazo, miembro2, **manilla**, comprobante, logoUrl, equipo, **fecha_registro** |
| `instituciones` | 1 | INSTITUCION — lista permanente. **Dedupe es case-sensitive** |
| `activo` | 3 | ruta, raw_json, timestamp |
| `resultados` | 9 | participanteId, nombre, robot, institucion, tiempo, ronda, intento, ruta, fecha |
| `estados` | 3 | ruta, json, timestamp |
| `categorias_activas` | 5 | ruta/categoria, usuario, timestamp, estado, ronda |
| `certificados` | 10 | correo, nombre_completo, categoria, institucion, evento, fecha_evento, tipo_certificado, fecha_generacion, codigo_verificacion, archivoUrl |
| `criterios_calificacion` | 7 | categoria (bai/dev/lk), nombre, descripcion, orden, activo, timestamp, peso |
| `puntuaciones` | 11 | id_participante, nombre, robot, institucion, categoria, juez_email, juez_nombre, criterios_json, notas_json, total, timestamp |
| `bracket_general` | 13 | torneo_id, categoria, fase, partido_id, equipo_a_id, equipo_a_nombre, equipo_b_id, equipo_b_nombre, ganador_id, marcador, estado, siguiente_partido_id, timestamp — **ms_a, ms_rc, bat** (NO soccer) |
| `soccer_torneo` | 13 | torneo_id, formato, grupo, partido_id, equipo_a_id, equipo_a_nombre, equipo_b_id, equipo_b_nombre, ganador_id, marcador, estado, partido_num, timestamp — **solo soc** |
| `podio_manual` | 5 | categoria, posicion, equipo_id, equipo_nombre, timestamp |
| `resultados_publicados` | 3 | categoria, ranking_json, timestamp — **bai/dev/lk permanentes** |

---

## BRACKET GENERAL (ms_a, ms_rc, bat) — Lógica de fases progresivas

**Actualizado 19-jul-2026**: eliminación directa 1vs1 siempre, sin importar cuántos equipos arranquen. Fases generadas progresivamente en GAS — solo genera la primera ronda; cada siguiente se genera cuando la anterior termina.

| n | Formato |
|---|---|
| 2 | FINAL directa |
| 3 | 1 BYE + 1 combate → 2 → FINAL |
| 4 | RONDA 1 (2 combates) → FINAL |
| 5 | RONDA 1 (1 BYE + 2 combates) → 3 sobrevivientes → siguiente RONDA (1 BYE + 1 combate) → FINAL |
| 6 | RONDA 1 (3 combates) → 3 sobrevivientes → siguiente RONDA (1 BYE + 1 combate) → FINAL |
| 7+ | Rondas sucesivas con sorteo aleatorio (BYE si es impar, nunca el mismo equipo dos rondas seguidas) hasta quedar 2 → FINAL |

**"TODOS CONTRA TODOS" fue el formato anterior y quedó descartado** (confirmado con Raku 19-jul-2026: nunca debía desviarse a tabla de puntos, ni siquiera cuando la cantidad de sobrevivientes caía en 3) — ya no se genera para torneos nuevos. El código que lee/calcula podio de ese formato se mantiene solo por brackets viejos que ya lo jugaron con resultados reales (ej. Minisumo Autónomo, torneo de Axebot/Kitsune/Kachetes 2.0, jugado antes del fix — no se reinterpreta ni se deshace).

**Estados en bracket_general**: `PENDIENTE`, `FINALIZADO`, `BYE_PENDIENTE`
- `BYE_PENDIENTE` → frontend lo normaliza a `FINALIZADO` tipo `BYE`
- `TODOS CONTRA TODOS` terminado (solo brackets viejos) → **no genera fase siguiente** (podio por tabla de puntos)
- `FINAL` terminado → **no genera fase siguiente**
- `guardarPodioManual` con `posiciones: []` → **no llama publicarJSON** (para no borrar bracket del JSON)
- Fases "RONDA N" se detectan dinámicamente al armar la respuesta para el frontend (`parsearBracketGeneral`) — no asumir una lista fija de nombres, cualquier bracket con suficientes equipos puede necesitar más de 2 rondas

**3er lugar en brackets sin partido de 3er lugar:** botón "🥉 3er lugar" aparece cuando FINAL está finalizada y hay SEMIFINAL. Muestra todos los participantes excepto finalistas para elegir manualmente. Se guarda en `podio_manual` con 1ro+2do+3ro. RESULTADOS lee `podio_manual` del JSON como fallback para el 3ro.

**RESULTADOS — podio TODOS CONTRA TODOS (solo brackets viejos):** se calcula localmente desde los partidos del TCV (puntos: victoria=3, derrota=0), sin necesidad de `podio_manual`.

---

## PANTALLA / CRONOGRAMA — Sprint 25 jun 2026

La página `PANTALLA/index.html` es el cronograma del evento. Tiene dos modos:

### Modo normal (página web)
- Muestra el mismo grid que el fullscreen dentro de la card institucional
- Presiona **F** para entrar a fullscreen / **ESC** para salir
- Hint texto pequeño en gris arriba del grid

### Modo fullscreen (F key)
- `#fsOverlay` con `position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647 !important`
- Header blanco: logo Club Robótica (izquierda) + título 4ta edición (centro) + logo Sucre + reloj Orbitron (derecha)
- Footer blanco: URL izquierda + reloj centro + fecha derecha
- Grid con columnas Auditorio + Escenario 1–4

### ⚠️ Conflicto CSS crítico — PANTALLA
El archivo original del repo tiene un bloque CSS grande para `#fsOverlay` que choca con el nuevo CSS. Al reconstruir:
1. Cortar el HTML en `<!-- FULLSCREEN -->` (línea ~241 del original)
2. Todo lo de antes es la base limpia
3. Agregar nuevo `<style>` con `#fsOverlay { ... !important }` + overlay HTML + `<script>` único al final
4. El nuevo `#fsOverlay` CSS debe usar `!important` en todo para ganar el cascade de `styles.css`
5. Verificar con `node --check` que el JS es válido antes de entregar

---

## PANEL-CALIFICACION — Sprint 27 jun 2026

### Categorías y flujos

#### Bailarín (`bai`) — 6 pasos
**Stepper:** Categoría → Presentes → Eliminatoria → Rk. Eliminatoria → Final → Ranking Final

- **Criterios oficiales**:
  | Criterio | Pts |
  |---|---|
  | Sincronización musical | 40 |
  | Puesta en escena y escenario | 25 |
  | Complejidad de movimientos | 25 |
  | Originalidad | 10 |

- **3 jueces simultáneos** (`BAI_JUECES`): `juez1@bai`, `juez2@bai`, `juez3@bai`
- Ranking usa **promedio** de los 3 jueces
- **Fase 2 (Ronda Final):** guardada en GAS con `categoria: 'bai_final'`

#### Impacto Tecnológico (`dev`) — 4 pasos
- **7 criterios oficiales** totalizando 100 pts
- **3 jueces simultáneos** (`DEV_JUECES`): `juez1@dev`, `juez2@dev`, `juez3@dev`
- Ranking usa **promedio** de los 3 jueces

#### Lego Kids (`lk`) — 4 pasos
- **2 fases**: Fase 1 (Ensamble 50 + Funcionalidad 20 = 70 pts) → Fase 2 (Tiempo carrera 0–30 pts)
- Un solo operador

### Flujo de 3 jueces simultáneos (dev y bai)
- Cada dispositivo selecciona su juez en paso 1
- `state.calificacionesPorJuez[id][juezEmail]` guarda notas por juez
- GAS: `calcularRankingCalificacion` usa promedio para `CATS_PROMEDIO_JUECES = { dev, bai, bai_final, lk }`

### Presencia de jueces (polling 10s)
- Al seleccionar juez → publica `setEstado` con key `juez_cal_<cat>_<idx>`
- Poll cada 10s lee `getAllEstados` y marca botones ocupados en **naranja** con "⚠ En uso"
- TTL de 60s: si no hay heartbeat, el juez se considera liberado
- Al cambiar categoría o terminar → limpia presencia en GAS

### Resultados publicados (bai/dev/lk)
- `publicarPodioCalificacion` escribe en hoja `resultados_publicados` (permanente, no se sobreescribe)
- `publicarJSON` lee exclusivamente de `resultados_publicados` para bai/dev/lk
- `limpiarCertificadosDEV()` — función GAS para limpiar certificados de prueba sin afectar resultados reales

---

## PANEL-BRACKET — Sprint 28-29 jun 2026

### Categorías
- `ms_a` (Minisumo Autónomo), `ms_rc` (Minisumo RC) → tipo `minisumo`
- `bat` (Batalla) → tipo `batalla`
- `soc` (Soccer) → tipo `soccer`

### Panel Minisumo (ms_a, ms_rc)
Panel propio con lógica del reglamento oficial:
- **3 asaltos** (posiciones: De espaldas / De lado / Frente a frente)
- **Puntos POR ASALTO**: Expulsión +1, Abandono +1, Amonestación −1
- **Ganador de asalto** = más puntos al terminar el tiempo del asalto
- **Ganador del combate** = gana 2 de 3 asaltos
- Botones de puntuación **bloqueados** hasta presionar "Iniciar asalto"
- Cronómetro basado en `Date.now()` — resiste cambio de pestaña
- Botón **🔧 X no funciona** → retiro inmediato, oponente gana el combate
- Marcador grande muestra **puntos del asalto actual** (se reinicia por asalto)
- Subtítulo muestra **asaltos ganados** acumulados

### Panel Batalla (bat)
- Botones: Inmovilizar +10, Embestida +5, Vuelco +15, Embestida con arma +15
- Amonestación −5, Tiempo técnico, Nocaut, Abandono

### JSON publicado
- `bracket: { ms_a, ms_rc, bat }` — bracket general
- `podio_manual: { ms_a, ms_rc, bat }` — podio manual para 3er lugar
- `soccer` — torneo soccer completo

---

## MODO OFFLINE (Excel local) — Sprint 07 jul 2026

### Contexto y motivación
Plan de contingencia para el evento en caso de corte de internet. Decisión de diseño clave desde el primer análisis: el **hardware (Web Serial) no depende de internet** — solo el paso de *guardar* el resultado en Sheets. La solución no duplica lógica de negocio en un sistema paralelo; **envuelve las mismas llamadas GAS existentes** con una cola local en Excel.

### Arquitectura: `shared/js/offline-excel.js`
Módulo genérico y reutilizable (usa File System Access API — **solo Chrome/Edge**, igual limitación que Web Serial — + SheetJS). Un único archivo `.xlsx` local hace de "base de datos" mientras no hay internet.

**SheetJS autohospedado**: se movió de CDN (`cdnjs.cloudflare.com`) a `shared/js/vendor/xlsx.full.min.js` (mismo v0.18.5, bajado del paquete npm `xlsx@0.18.5`) para que el modo offline no dependa de ningún recurso externo.

**4 hojas dentro del mismo archivo**:
| Hoja | Contenido | Usada por |
|---|---|---|
| `Participantes` | Export de `getParticipantes` (id, nombre, robot, institucion, ciudad, categoria, correo, miembro2, aprobado) | Todos |
| `Resultados_Offline` | Tiempos (mismo shape que `pushResultado`) + columna `sincronizado` | CRONOMETRO, INSECTOS |
| `Podio_Offline` | Certificados de podio (mismo shape que `guardarCertificado`) + `sincronizado` | CRONOMETRO, INSECTOS |
| `Puntuaciones_Offline` | Calificaciones de jueces (mismo shape que `guardarPuntuacion`, criterios/notas como JSON string) + `sincronizado` | PANEL-CALIFICACION |

**API pública del módulo** (`window.OfflineExcel`):
```js
soportado()                          // true si el navegador soporta File System Access API
crearNuevo(nombreSugerido)            // crea .xlsx nuevo (usar CON internet, antes del evento)
activar()                             // abre .xlsx existente (usar SIN internet)
importarParticipantesDesdeGAS(gasUrl) // llena hoja Participantes desde getParticipantes
estaActivo()
getParticipantes(categoria)           // filtra por categoria + aprobado==='APROBADO'
guardarResultado(data)                // append a Resultados_Offline + reescribe disco
guardarPodio(filasArray)               // append a Podio_Offline + reescribe disco
guardarPuntuacion(data)                // append a Puntuaciones_Offline + reescribe disco
contarPendientes()                    // suma de las 3 hojas de datos
sincronizar(gasUrl, onProgress)       // sube TODO lo pendiente (3 hojas) a GAS, marca sincronizado='TRUE'
desactivar()                          // vuelve a modo online sin recargar página
```

Cada operación de guardado reescribe el archivo completo en disco inmediatamente (`fileHandle.createWritable()`), así que no se pierde nada aunque se cierre la pestaña o se apague el equipo.

### Patrón de integración por página
Cada módulo que soporta offline agrega:
1. `<script src="../shared/js/vendor/xlsx.full.min.js">` + `<script src="../shared/js/offline-excel.js">` en el `<head>`
2. Panel de UI en el Paso 1 con 4 botones: 🆕 Crear archivo / 📂 Abrir archivo / 🔄 Sincronizar pendientes (badge con contador) / 🔌 Volver a modo normal
3. Badge de estado (`actualizarBadgeOffline()`) — se actualiza tras cada guardado y al cargar la página
4. **Cada punto donde la página llama a GAS** se bifurca con `if (window.OfflineExcel && OfflineExcel.estaActivo())` → usa el Excel local; si no, código original sin cambios
5. Botón "Volver a modo normal" (`desactivarModoOffline()`) — pide confirmación si quedan pendientes sin sincronizar

### Módulos cubiertos

**CRONOMETRO** — ✅ completo, probado en vivo de punta a punta (crear archivo → cortar WiFi → cronometrar → guardar podio → cerrar categoría → reconectar → sincronizar → volver a modo normal). Bugs reales encontrados y corregidos durante las pruebas (no eran evidentes de antemano, se me habían escapado del primer parche):
- `confirmarIniciarCrono()` exigía `bloquearCategoria` exitoso incluso offline → bloqueaba con "❌ No se pudo bloquear la categoría". Fix: `ok = modoOffline ? true : await bloquearCategoria(...)`
- `confirmarCerrarCategoria()` tenía el mismo problema con un `Promise.all` de 2 fetches sin rama offline
- Restauración de sesión al recargar página (`cronometro_categoria_activa` en localStorage) también llamaba a `bloquearCategoria` sin chequear offline
- **Lección**: cuando se agrega modo offline a una página con múltiples puntos de entrada al mismo flujo (iniciar, cerrar, restaurar sesión), hay que buscar **todas** las llamadas a la función de bloqueo, no solo la más obvia — grep por el nombre de la función, no confiar en un solo punto de entrada revisado.

**INSECTOS** — ✅ completo, mismo patrón que CRONOMETRO (arquitectura simple: un solo dispositivo, sin bloqueo de categoría, sin multi-juez). No probado en vivo aún.

**PANEL-CALIFICACION** — ✅ parcial por diseño:
- Guardar calificación individual (cada juez) → offline funciona igual que CRONOMETRO
- **"Guardar Podio" / "Guardar Podio Final" → BLOQUEADO intencionalmente offline**, con `alert()` explicativo. Razón: `CATS_MULTI_JUEZ = { dev: DEV_JUECES, bai: BAI_JUECES, lk: LK_JUECES }` — **las 3 categorías** usan 2-3 jueces simultáneos en dispositivos separados. El ranking final es un promedio entre jueces que solo se puede calcular combinando lo que subió cada dispositivo — imposible de reconstruir correctamente desde el Excel local de un solo dispositivo. Regla operativa: calificar offline sin problema; cuando vuelva el internet, **todos los jueces de esa categoría sincronizan primero**, y recién ahí se guarda el podio en modo normal (online).

**PANEL-BRACKET** — 🚫 sin Excel local, decisión de Raku (07 jul 2026). Razón: a diferencia de CRONOMETRO/INSECTOS, el emparejamiento de cada siguiente ronda (bracket general y torneo soccer) lo decide el servidor (`_revisarAvanceFase` en Code.gs, sorteos aleatorios, byes) — no existe esa lógica en el frontend. Replicarla completa en JS para 9 días de margen se consideró demasiado riesgoso. **Respaldo: papel**, sin código de contingencia.

### Service Worker — carga de páginas sin internet
Complementa el Excel local (que protege los *datos*) resolviendo que la *página misma* cargue sin conexión, incluso al recargar.

- **`/sw.js`** en la **raíz del repo** (no dentro de `shared/`) — el scope de un Service Worker es el directorio donde vive el archivo; tiene que estar en la raíz para cubrir todas las subcarpetas (`CRONOMETRO/`, `INSECTOS/`, etc.)
- Estrategia **"red primero, caché como respaldo"**: con internet, cada petición sigue yendo a la red exactamente igual que sin Service Worker (0 cambio de comportamiento online); solo si la red falla, sirve la última copia cacheada
- Solo intercepta peticiones **GET del mismo origen** — nunca toca POST (llamadas a GAS) ni otros orígenes (Google OAuth, etc.), así que no puede interferir con la lógica de negocio
- **`shared/js/sw-register.js`** — se incluye con `<script src="../shared/js/sw-register.js">`, registra `/Sucrebot/sw.js` (ruta absoluta, no relativa, para que funcione igual sin importar la profundidad de carpeta)
- **Alcance actual: solo CRONOMETRO, PANEL-CALIFICACION, INSECTOS** — no se agregó al resto del sitio (ej. REGISTRO, que sigue activo hasta el evento) para minimizar riesgo; extensión al resto del sitio queda pendiente/opcional
- Después de visitar una de estas 3 páginas una vez con internet, queda disponible para recargar (`Ctrl+Shift+R` incluido) o reabrir sin conexión

---

## ROBOT SOCCER — Reglamento oficial vs sistema (verificado 29 jun 2026)

Fuente: `Reglamento_RobotSoccer_Pro_Validado.docx`. Verificación punto por punto contra `PANEL-BRACKET/index.html` (cronómetro soccer) y `Code.gs` (`soccer_torneo`).

### Reglas confirmadas e implementadas
- **2 tiempos de 2 min** + descanso intermedio de 1 min (manual, el operador inicia T2 cuando quiera)
- **Empate al final de T2** → alargue de 1 min → si sigue empate → **penales** (3 disparos + muerte súbita)
- **5 amonestaciones acumuladas** → derrota automática, +2 goles al rival (`amonestar()` ahora pide confirmación y llama `descalificarEquipo()` automáticamente al llegar a 5 — antes solo avisaba y el botón de descalificar era manual)
- **Minuto técnico**: único por equipo por partido. Implementado con botones `⏱ Min. técnico A/B` en el cronómetro soccer — bloquea el botón tras el primer uso (`cron.mtUsadoA/B`), pausa el cronómetro al activarlo
- **Equipo sin robots funcionales** → victoria del rival con diferencia de 2 goles. Implementado con botones `🔧 A sin robots / B sin robots` — calcula `max(golesRival, golesInfractor+2)` y cierra el partido como descalificación
- **Autogoles no suman ni sancionan** → el sistema simplemente no tiene botón de autogol, así que nunca se suman por error (correcto por diseño, no requiere cambio)

### Puntos de bajo impacto (no requieren fix, quedan a discreción del árbitro)
- Penales "no secuenciales por un mismo operario" (orden alternado A/B) — el sistema no fuerza el orden, el árbitro lo controla manualmente
- Descanso de 1 min antes del alargue — no hay timer dedicado, el operador espera antes de iniciar

### Bug crítico encontrado y corregido: marcador guardado como fecha
**Síntoma**: en RESULTADOS/PANEL-BRACKET aparecía algo como `2026-03-04T05:00:00.000Z` en vez de `"3-4"` como marcador.
**Causa raíz**: `sh.getRange(...).setValue(marcador)` en GAS — Google Sheets autodetecta tipo de dato, y un string que matchea un patrón de fecha (ej. "3-4" interpretado como día-mes) se coacciona a `Date` internamente. Al leerlo de vuelta sale el ISO timestamp completo.
**Fix aplicado** (3 ubicaciones en `Code.gs`, todas en el flujo de soccer):
```js
// ANTES (vulnerable a autodetección de fecha):
sh.getRange(idx + 2, 10).setValue(marcador);

// DESPUÉS (fuerza texto, igual patrón que ya se usaba para 'contacto'):
sh.getRange(idx + 2, 10).setNumberFormat('@').setValue(String(marcador));
```
Aplicado en: `registrarResultadoSoccerHelper` (col marcador), `cerrarAuto` (col marcador = 'AUTO'), bloque `IDA_VUELTA` aggregate (col marcador con string compuesto).
**Para reparar datos ya corrompidos**: en la hoja `soccer_torneo`, columna J (marcador), reemplazar manualmente el valor — asegurando que la celda tenga formato "Texto sin formato" antes de escribir.
**Principio general**: cualquier futura escritura de un campo de texto libre en Sheets vía GAS que pueda matchear un patrón de fecha/número debe forzar `setNumberFormat('@')` antes de `setValue()`. Ya se aplicaba a `contacto` (teléfonos); ahora también a marcadores de soccer.

---

## ROBOT SOCCER — Formatos 13 y 14 equipos + filtro de grupo por pista (sprint 09-jul-2026)

### Contexto
A 7 días del evento se confirmaron **14 equipos inscritos** en Soccer, superando el límite anterior de `generarTorneoSoccerHelper` (`if (n > 12) throw new Error(...)`). Se amplió a 14 sin tocar nada del comportamiento de 2-12 equipos (que ya funcionaba y no se quería arriesgar).

### `SOC_FORMATOS` — entradas nuevas
```js
13: 'GRUPOS_13',
14: 'GRUPOS_14'
```
Límite máximo actualizado: `if (n > 14) throw new Error('Máximo 14 equipos soportados actualmente');`

### Formato de 13 equipos (`GRUPOS_13`)
Sigue **exactamente el mismo patrón que 9-12** (no es un formato nuevo, es una extensión directa):
- 3 grupos: A(4) + B(4) + C(5), todos contra todos dentro de cada grupo
- Los 3 ganadores de grupo juegan una ronda de 3 (todos contra todos) — grupo `FINAL_TCV`
- Los 2 mejores de esa ronda van a la `FINAL` real (1er y 2do lugar)
- El 3ro de la ronda de 3 pasa directo a bronce sin partido (`3ER_AUTO`)
- En `avanzarFaseSoccer`: agregado a la condición existente `GRUPOS_9 || GRUPOS_10 || GRUPOS_11 || GRUPOS_12 || GRUPOS_13` (misma lógica, sin duplicar código)

### Formato de 14 equipos (`GRUPOS_14`) — estructura DISTINTA, sigue el patrón de `GRUPOS_8`
Decisión explícita de Raku, no es lo que se había planteado inicialmente (borrador previo con 3 grupos fue descartado):
- **2 grupos de 7** (no 3), todos contra todos dentro de cada grupo → **21 partidos por grupo, 42 en total** + 1 final = 43 partidos. Se avisó a Raku del volumen de partidos antes de implementar; decidió mantenerlo así.
- Ganador de Grupo A vs Ganador de Grupo B → `FINAL` directa (1er y 2do lugar)
- **3er lugar automático, sin partido**: se compara el 2do lugar de cada grupo por puntos → diferencia de gol → goles a favor (misma función `compara()` que ya usaba `GRUPOS_6`/`GRUPOS_8`)
- En `avanzarFaseSoccer`: agregado a la condición existente de `GRUPOS_8` → `formato === 'GRUPOS_8' || formato === 'GRUPOS_14'` (reutiliza 100% la lógica, cero código nuevo en esa función)

### ⚠️ Importante para futuros formatos de grupo
`calcularTablaSoccer` y `calcularPodioSoccerHelper` son completamente genéricos — no hay que tocarlos nunca al agregar un nuevo tamaño de torneo. Solo hacen falta 2 cambios en `Code.gs`:
1. Un nuevo bloque `else if (n === X) {...}` en `generarTorneoSoccerHelper` (arma los partidos)
2. Agregar el nuevo `formato` string a la condición correspondiente en `avanzarFaseSoccer` — **reutilizando** la condición de 3-grupos (patrón `GRUPOS_9-13`) o de 2-grupos (patrón `GRUPOS_8/14`) según cuántos grupos tenga el nuevo formato, nunca escribir un bloque `if` nuevo si la estructura de avance ya existe.

### Entrega de `Code.gs` — sin push a GitHub
Como siempre, `Code.gs` no se sube a GitHub. Para este cambio se armó el archivo completo `/mnt/project/Code.gs` + los 4 parches aplicados localmente y se entregó como descarga (`present_files`) para que Raku pegue el contenido completo en script.google.com (en vez de parches línea por línea, dado que eran 4 cambios distribuidos en el archivo). Tras el despliegue, Raku pasó el nuevo `DEPLOYMENT_ID` (`AKfycbyNrBUMsdXT_QN23aywDyx4d_OZA8wNxnH2hauUpcwV5PcRU3EXkRZfW9XO3QUC8hxxtw`) y se actualizó `shared/js/config.js` + commit a GitHub.

### PANEL-BRACKET — Filtro de grupo por dispositivo (para repartir jueces por pista)
Con 2 pistas físicas y 2 grupos simultáneos, se agregó una barra de filtro **client-side** arriba de la lista de partidos de Soccer:
- Botones: `Todos / 🔵 Grupo A / 🟢 Grupo B / 🟠 Grupo C` — **solo se muestran si el torneo tiene más de 1 grupo** (oculta automáticamente en formatos sin grupos como `IDA_VUELTA`/`TCV_SIMPLE`, y oculta el botón de Grupo C si no existe ese grupo)
- La elección se guarda en `localStorage` (`panel_bracket_soc_grupo_filtro`) **por dispositivo/navegador** — cada pista elige su grupo una vez y queda recordado entre recargas
- Filtra solo la sección de grupos (`GRUPO_A/B/C`); la sección **"Fase Final" siempre se muestra a todos**, sin importar el filtro, porque ambos jueces necesitan saber cuándo llega su turno ahí
- Es un filtro puramente visual/organizativo (no es un permiso real) — cualquier dispositivo puede cambiar de filtro y ver/jugar cualquier grupo si hace falta; el objetivo es evitar confusión operativa, no restringir acceso
- Función clave: `filtrarGrupoSoccer(g)` guarda en localStorage y vuelve a llamar `renderTorneoSoccer()`

---

## Overlay de carga con spinner — patrón estándar (sprint 09-jul-2026)

Patrón visual unificado para "está cargando, espera" en las 4 páginas operativas del día del evento: **CRONOMETRO, PANEL-CALIFICACION, PANEL-BRACKET, INSECTOS**.

### Estructura (idéntica en las 4 páginas)
```html
<div class="loading-overlay" id="loadingOverlay">
  <img src="../shared/images/sucrebot-sin%20fondo.png" alt="SucreBot" class="loading-logo">
  <div class="spinner"></div>
  <div class="loading-txt" id="loadingTxt">CARGANDO...</div>
</div>
```
```css
.loading-overlay{display:none;position:fixed;inset:0;background:rgba(14,18,30,0.7);backdrop-filter:blur(4px);align-items:center;justify-content:center;z-index:9000;flex-direction:column;gap:16px}
.loading-overlay.show{display:flex}
.loading-logo{width:72px;height:auto;margin-bottom:2px;filter:drop-shadow(0 0 14px rgba(91,200,240,0.5))}
.spinner{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
.loading-txt{font-family:'Orbitron';font-size:.7rem;color:#ffffff;letter-spacing:2px}
```
```js
function loading(show, txt='CARGANDO...') { document.getElementById('loadingOverlay').classList.toggle('show', show); document.getElementById('loadingTxt').textContent = txt; }
```
- **Texto blanco** (`#ffffff`), no cyan — decisión explícita de Raku para mejor contraste sobre el fondo oscuro difuminado
- Logo `shared/images/sucrebot-sin fondo.png` (el nombre del archivo tiene un espacio literal — usar `%20` en el `src`, ruta relativa `../shared/images/...`)
- **PANEL-CALIFICACION y PANEL-BRACKET ya tenían este overlay** desde antes; **CRONOMETRO e INSECTOS NO lo tenían** (usaban toast pequeño o texto estático dentro del contenedor) — se les agregó desde cero siguiendo este mismo patrón para unificar la experiencia
- Para cualquier página nueva que necesite este patrón: copiar el bloque completo tal cual, cambiar solo el mensaje pasado a `loading(true, '...')` en cada punto de carga

---

## CRONOMETRO — Guard anti doble-clic en selección de categoría (sprint 09-jul-2026)

### Bug real reportado por Raku
Al presionar varias veces seguidas la tarjeta de categoría (por ansiedad de que "no pasaba nada" antes de que existiera feedback visual), varios clics disparaban `elegirCategoria()` en paralelo. Uno de esos clics extra podía terminar cayendo, por posición en pantalla, sobre el botón **"← Volver"** del paso 2 (que aparece en el mismo lugar donde estaba la tarjeta, apenas cambia el panel) — el usuario veía que avanzaba a la pantalla de participantes y luego "se regresaba sola" al paso 1.

### Fix aplicado (mismo patrón en CRONOMETRO, PANEL-BRACKET y PANEL-CALIFICACION)
```js
let cargandoCategoria=false;
async function elegirCategoria(cat,ev){
  if(cargandoCategoria)return; // ignora clics repetidos
  cargandoCategoria=true;
  const grid=document.getElementById('catGrid'); // o .cat-grid / .cat-cards-grid según la página
  if(grid)grid.classList.add('cargando');
  // ...lógica original...
  } finally {
    loading(false);
    cargandoCategoria=false;
    if(grid)grid.classList.remove('cargando');
  }
}
```
```css
.cat-grid.cargando, .cat-cards-grid.cargando { pointer-events:none; opacity:.55; }
```
- La grilla completa de categorías queda semi-transparente y sin clics mientras carga — evita que un tap adicional caiga sobre el elemento que aparece después en esa misma posición de pantalla
- **Aplica a las 3 páginas con selector de categoría**: CRONOMETRO (`elegirCategoria`), PANEL-BRACKET (`seleccionarCategoria`), PANEL-CALIFICACION (`seleccionarCategoria`) — mismo bug, mismo fix, nombres de función/contenedor distintos por página
- INSECTOS no lo necesita (no tiene selector de categoría, es una sola página dedicada)
- **Principio general**: cualquier flujo que pasa de una pantalla a otra tras una operación async debe bloquear la UI de origen (pointer-events:none + guard booleano) mientras esa operación está en curso — un tap de más nunca debe poder "seguir" a la pantalla siguiente

---

## INICIO — Aviso de registro obligatorio de asistentes CMI (sprint 08-jul-2026)

Modal que aparece **cada vez que se abre INICIO** (no usa localStorage para suprimirlo tras la primera vez — decisión explícita de Raku, "que se vea cada vez"), con z-index por encima del splash de auspiciantes (100000 > 99999 del splash) para garantizar que se vea primero.

- Contenido: aviso de registro obligatorio para asistir al evento (autorización del edificio Ex UNASUR/CMI), fecha límite, botón directo al Google Form (`https://forms.gle/BTph45fZaJ6RW74T6`), botón ✕ para cerrar
- **Expiración automática integrada**: `new Date('2026-07-14T00:00:00-05:00')` — deja de mostrarse solo después del 13 de julio, sin que Raku tenga que acordarse de quitarlo manualmente
- También se agregó un ítem **"Registro de Asistentes CMI"** al dropdown "SucreBot 2026" del nav compartido (`shared/components/nav.html`) — abre el mismo Form en pestaña nueva, visible en todas las páginas del sitio por ser componente compartido

---

## RESULTADOS — Gate de acceso público (sprint 08-jul-2026)

A pedido de Raku, la página de Resultados en Vivo se ocultó al público general hasta nueva orden (prevista ~1 día antes del evento, fecha exacta pendiente de aviso).

### Mecanismo
```js
const RESULTADOS_ABIERTO_AL_PUBLICO = false; // ← cambiar a true cuando Raku avise
const RESULTADOS_STAFF_TOKEN = 'SucreBot2026-CMI-Sucre-x7k9mQ';
```
- Si `localStorage.getItem('sucrebot_staff_token') === RESULTADOS_STAFF_TOKEN` (staff logueado) **o** `RESULTADOS_ABIERTO_AL_PUBLICO === true` → la página funciona normal, sin ningún bloqueo
- Si no: se oculta `<main class="screen">` (`display:none`, sin borrar el DOM — evita errores de `getElementById(...).innerHTML` en el resto del script) y se inserta un overlay "Resultados en Vivo — disponible próximamente" con el mismo estilo institucional
- **⚠️ Pendiente activar antes del evento**: cuando Raku confirme la fecha, cambiar esa única constante a `true`, commitear y listo — no requiere tocar Code.gs ni nada más

---

Dos puntos de exportación a Excel, ambos vía SheetJS cargado desde CDN (`https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`), agregado al `<head>` de cada página.

### MANILLAS — botón "📊 Participantes Excel"
- Lee de `localStorage.getItem('participantes')` (la key real es `'participantes'`, NO `'sucrebot_manillas_cache'` — verificar la key de caché correcta antes de implementar features similares)
- Excluye participantes con `[DEV]` en nombre o robot
- Incluye TODOS los estados (aprobados, en revisión, etc.) — no solo aprobados
- Columnas: #, ID, Capitán, Subcapitán, Robot, Categoría, Institución, Provincia, Estado, Manilla
- Usa `showToast()` para mensajes — NO `toast()` (función inexistente en MANILLAS, causa `TypeError: toast is not a function`)
- Nombre archivo: `SucreBot2026_Participantes_<fecha>.xlsx`

### PANEL-BRACKET (paso 3, solo torneo soccer) — botón "📊 Excel"
- Visible solo cuando `state.tipo === 'soccer'` (oculto vía `id="btnExcelSoccer"` con `style.display` controlado en `actualizarTitulos()`)
- Lee de `state.torneoSoc` (no de localStorage — viene directo del estado en memoria tras `generarTorneoSoccer`/`getSoccerTorneo`)
- Hoja 1 "Partidos Soccer": todos los partidos con fase (label legible: Final, Final TCV, 3er Lugar, Grupo A/B/C, etc.), equipos, marcador, ganador, estado
- Hojas adicionales: una tabla de posiciones por cada grupo (`torneo.tabla[grupo]`) con PJ/G/P/GF/GC/DIF/PTS
- Nombre archivo: `SucreBot2026_Soccer_<fecha>.xlsx`

### Patrón general para nuevas exportaciones Excel
1. Verificar SIEMPRE el nombre real de la función de toast/notificación en esa página antes de usarla (varía: `toast()` en algunas páginas, `showToast()` en otras)
2. Verificar la key real de localStorage si se va a leer caché (no asumir nombres "lógicos")
3. Preferir leer de `state.*` en memoria cuando la página ya tiene el dato cargado, en vez de re-leer localStorage
4. Excluir siempre `[DEV]` salvo que se pida explícitamente lo contrario
5. `ws['!cols']` con anchos explícitos para legibilidad
6. Nombre de archivo con fecha: `SucreBot2026_<seccion>_<fecha-es-EC-con-guiones>.xlsx`

---

## CRONÓMETRO SOCCER — Date.now() (sprint 29 jun 2026)

**Bug**: el cronómetro de soccer (T1/T2/alargue) usaba `setInterval` puro con decremento simple (`cron.segundos--`), igual que tenía Minisumo antes de su fix. Al cambiar de pestaña, los navegadores throttlean `setInterval`, causando que el tiempo se atrase o se congele.

**Fix aplicado en `cronIniciar()`**: migrado al mismo patrón que ya usa Minisumo (`ms._tsInicio`):
```js
cron._tsInicio = Date.now();
cron._segAlIniciar = cron.segundos;
cron.interval = setInterval(() => {
  const transcurrido = Math.floor((Date.now() - cron._tsInicio) / 1000);
  const restantes = Math.max(0, cron._segAlIniciar - transcurrido);
  cron.segundos = restantes;
  actualizarDisplayCron();
  if (restantes === 30) toast('⚠️ 30 segundos restantes', 'error');
  if (restantes === 0) { cronPausar(); finDeTiempo(); }
}, 250);
```
Tick cada 250ms (en vez de 1000ms) para mayor precisión visual, pero el cálculo real siempre se basa en el timestamp, no en el contador de ticks.

**Principio**: cualquier cronómetro/temporizador en el proyecto debe basarse en `Date.now()` + timestamp de inicio guardado en el objeto de estado, nunca en decremento puro dentro del `setInterval`. Ya aplicado a: Minisumo (`ms`), Cronómetro Soccer (`cron`). Pendiente verificar: Combate Batalla (`combate`) si presenta el mismo síntoma.

---

## MANILLAS — Colores por categoría (OFICIAL)

12 colores, 400 unidades total:
| # | Color | Hex | Cantidad | Categoría 1 | Categoría 2 |
|---|---|---|---|---|---|
| 1 | MORADO OSCURO | `#7B2D8B` | 40 | seguidor de linea ST | |
| 2 | MORADO CLARO | `#9B59B6` | 30 | minisumo autonomo | |
| 3 | AZUL | `#2980B9` | 60 | insectos | lego kids |
| 4 | TURQUEZA | `#16A085` | 40 | trepador (amateur) | |
| 5 | CELESTE | `#00BFFF` | 40 | seguidor (amateur) | |
| 6 | VERDE | `#27AE60` | 20 | bailarin | |
| 7 | MAGENTA | `#E91E8C` | 20 | batalla 3lb | |
| 8 | NARANJA | `#E67E22` | 30 | trepador (pro) | |
| 9 | ROJO | `#CC0000` | 30 | liga robot soccer | |
| 10 | AMARILLO | `#F5A623` | 30 | minisumo rc | |
| 11 | DORADO | `#D4AF37` | 30 | impacto tecnologico | |
| 12 | PLATEADO | `#C0C0C0` | 30 | cubo rubik | |

**textContrast:** Celeste, Plateado, Dorado, Amarillo → texto `#1a1a1a`. Resto → texto `#ffffff`.

---

## GAS Actions — Referencia rápida

### doPost actions
`setParticipante`, `uploadComprobante`, `uploadLogo`, `renombrarLogo`, `enviarQR`, `marcarManilla`, `pushResultado`, `eliminarResultado`, `setActivo`, `clearActivo`, `setEstado`, `activarCategoria`, `finalizarCategoria`, `bloquearCategoria`, `desbloquearCategoria`, `guardarCertificado`, `uploadDiploma`, `guardarPuntuacion`, `guardarCriterios`, `resetearCalificacionCategoria`, `generarBracketGeneral`, `registrarResultadoGeneral`, `resetearBracketGeneral`, `guardarPodioManual`, `publicarPodioCalificacion`, `generarTorneoSoccer`, `registrarResultadoSoccer`, `resetearTorneoSoccer`

### doGet actions
`getReglamentos`, `getInstituciones`, `aprobarParticipante`, `eliminarParticipante`, `desaprobarParticipante`, `noCumpleRequisitos`, `actualizarParticipante`, `getParticipantes`, `getActivo`, `getAllActivos`, `getAllEstados`, `getEstadoCategorias`, `getCategoriasActivas`, `obtenerCertificados`, `verificarCertificado`, `obtenerTodosCertificados`, `getCriterios`, `getPuntuaciones`, `getRankingCalificacion`, `getBracketGeneral`, `getTablaPosiciones`, `getPodioManual`, `getRankingInstituciones`, `getSoccerTorneo`, `getPodioSoccer`

### GAS — Funciones de utilidad manual (ejecutar desde editor GAS)
- `limpiarCertificadosDEV()` — borra certificados con nombre `[DEV]` + llama `publicarJSON`
- `debugPublicarJSON()` — verifica token y URL sin publicar
- `testEnviarQR()` — prueba envío de correo QR

### GAS — calcularRankingCalificacion
```js
var CATS_PROMEDIO_JUECES = { 'dev': true, 'bai': true, 'bai_final': true, 'lk': true };
```

---

## Sprint 03 jul 2026

### CRONOMETRO — Sensor Trepador (ESP32) intermitente
**Síntoma reportado:** el sensor E18-D80NK necesitaba 2-3 pasadas de mano para registrar STOP, en vez de 1.

**Fix de sincronización aplicado (válido, se mantiene aunque no fue la causa raíz):**
- Firmware ESP32 (`trepador_sensor.ino`): al recibir `'R'` ahora responde inmediatamente `Serial.println("ARMED")` y captura `estadoAnterior = digitalRead(SENSOR)` en el momento exacto de armar, para una línea base limpia.
- `CRONOMETRO/index.html`: `iniciarCrono()` ahora es `async`. Para `CATS_ARM_ESPERA = ['Trepador (Amateur)','Trepador (Pro)']`, si hay dispositivo conectado, espera confirmación `ARMED` (timeout de respaldo 400ms) antes de arrancar el crono visual — cierra la ventana de carrera entre el clic de "Iniciar" y el momento real en que el ESP32 empieza a vigilar el sensor.
- Nuevas funciones expuestas por el IIFE de Web Serial: `window.puertoConectado()`, `window.armarYEsperar(timeoutMs)`.

**Causa real encontrada después:** no era software — el sensor E18-D80NK estaba mal calibrado (potenciómetro de sensibilidad/alcance) y quedaba con su propia luz encendida de forma permanente. Solución física: alejar objetos del alcance, girar el potenciómetro (antihorario = reduce alcance) hasta que la luz se apagara en reposo, y realinear el lente.

**Principio:** cuando la luz que se queda prendida es la del **sensor mismo** (no un LED controlado por el ESP32 como `LED_VERDE`/`LED_ROJO`), es calibración física, no bug de código — revisar eso primero.

### CRONOMETRO — Web Serial: NetworkError sin manejar
Los dos `pipeTo()` (`conectar()` para escritura, `escuchar()` para lectura) no tenían `.catch()`, generando `Uncaught (in promise) NetworkError: The device has been lost` en consola cada vez que el ESP32 se desconecta físicamente. Fix: `.catch(()=>{})` agregado a ambos.

### LEGO KIDS — Cierre de inscripciones
- `REGISTRO/index.html`: option del select `disabled` con label "Lego Kids (AGOTADAS)"; aviso rojo debajo del select si el valor llega a quedar seleccionado igual (defensivo); validación también en `registrarParticipante()` antes de llamar al backend.
- Tarjeta visual "🧱 Lego Kids — Inscripciones agotadas" agregada al panel de precios flotante (`.precios-panel` desktop y `.precios-movil` móvil).
- **Hueco real encontrado:** el bloqueo era solo de frontend — `Code.gs` (`setParticipante`) no validaba la categoría. Una pestaña vieja (JS sin el bloqueo) o una llamada directa a la API podía registrar en Lego Kids igual. Confirmado que pasó (inscripción después del cierre).
- **Fix backend** (`Code.gs`): constante `CATEGORIAS_CERRADAS = ['Lego Kids']` + bloqueo en `setParticipante` solo para registros **nuevos** (`idx < 0`), permitiendo que participantes ya existentes en esa categoría sigan editando sus propios datos.
- `REGISTRO/index.html` maneja la respuesta `{ error: 'CATEGORIA_CERRADA', mensaje }` del backend mostrando `mensaje` al usuario.
- **Principio:** todo bloqueo de negocio (categorías cerradas, cupos, fechas límite) debe validarse en `Code.gs`, nunca solo en el frontend — el frontend puede quedar cacheado/desactualizado en el navegador del usuario.
- ⚠️ **Pendiente confirmar con Raku:** que ya pegó el `Code.gs` actualizado en script.google.com, implementó nueva versión y pasó el nuevo Deployment ID. No verificable remotamente (Code.gs nunca se commitea a git).

### INICIO — Carrusel de auspiciantes
- Velocidad: `SPEED_PX_S` de 15 → 22 (~47% más rápido).
- **Bug corregido:** al soltar el arrastre (drag), el carrusel animaba `translateX(0px)` — regresaba visualmente al inicio en vez de continuar desde donde el usuario lo dejó. Fix: `reanudarDesdeAqui()` calcula la posición normalizada (`getTranslateX(track) % distancia`, ya que el track está duplicado y cualquier posición congruente luce idéntica) y reactiva la animación con `animation-delay` negativo para continuar sin salto.
- Grace period tras soltar reducido de 2200ms a 1000ms.
- **Principio:** para reanudar una animación CSS infinita desde una posición arbitraria sin salto visual, usar `animation-delay` negativo calculado como `-(progreso * duracion)`, nunca animar de vuelta a un punto fijo.

### FAQ
Nueva pregunta en "📋 Inscripción y Costos": *"No puedo subir mi comprobante o logo porque está en OneDrive/Google Drive, ¿qué hago?"* — pasos para descargar localmente (computador y celular) antes de subir al formulario.

### REGLAMENTO — Imagen de pista (Seguidor de línea ST Pro)
- Nueva imagen `shared/images/pistas/seguidor-pro-velocidad.png` (optimizada de 239KB a 80KB vía `im.quantize(colors=32, method=Image.FASTOCTREE)`).
- Campo `pistaImg: '../shared/images/pistas/archivo.png'` agregado a la entrada de la categoría en `CATEGORIAS` — patrón reutilizable para agregar pista a cualquier otra categoría.
- Botones nuevos: "🗺️ Descargar Pista" (descarga directa) y "👁 Ver Pista" (preview inline expandible vía `toggleImagenPista()` / `cerrarImagenPista()`).
- ⚠️ **Cuidado:** el botón "Ver Pista" usa clase CSS separada `btn-reg-preview-pista` (distinta de `btn-reg-preview`, usada por "Vista previa" del PDF). Compartir la misma clase rompe `cerrarIframe()`/`cerrarImagenPista()`, porque ambas funciones buscan el botón hermano con `querySelector('.clase')` y toman el primer match — si dos botones comparten clase, se actualiza el texto del botón equivocado al cerrar.
- Orden final de botones: Descargar PDF → Vista previa → Descargar Pista → Ver Pista.

### PANTALLA
Typo corregido: "Bailaín" → "Bailarín" (2 ocurrencias: clave de `COLOR_MAP` y campo `name` del cronograma).

### PARTICIPANTES_REGISTRADOS
- Bug corregido: `renderizarInstitucionesGestor()` (panel "Gestionar Instituciones/Clubes") contaba desde `_participantesIndex` sin filtrar, incluyendo registros `[DEV]` — inconsistente con el resto de las estadísticas de la página. Ahora filtra igual que `cargarListaLocal()`.
- Confirmado que `guardarInstitucion()` (la función que realmente renombra/fusiona instituciones) sigue aplicando el cambio a **todos** los participantes que coincidan, incluidos `[DEV]` — correcto, evita dejar datos de prueba con nombres desactualizados. Solo el número **mostrado** en pantalla excluye `[DEV]`.

---

## Sprint 13-15 jul 2026 — CRONOMETRO/INSECTOS layout, INSECTOS FINAL mejor-de-2, certificados, respaldos de papel

### CRONOMETRO/INSECTOS — bug real de layout: panel de controles se perdía al hacer scroll
**Síntoma reportado por Raku**: en la vista de escritorio ancha (grid de 3 columnas), al bajar para ver participantes más abajo en la lista de ranking, el cronómetro y sus botones (Iniciar/Detener/Siguiente intento) desaparecían de la pantalla — había que scrollear de vuelta arriba para usarlos.
**Causa raíz real** (no era el layout móvil apilado, que se sospechó primero): `.ranking-card` tenía `height:100%` dentro de un grid CSS. Con muchos participantes, esa altura no se resolvía bien y la tarjeta crecía con TODO el contenido de la lista — y como es un grid, esa fila gigante "estiraba" también las columnas del cronómetro/config (`align-items` por defecto es `stretch`), dejando sus botones pegados arriba con espacio vacío debajo. Al bajar a ver participantes de más abajo, el cronómetro ya había quedado muy por encima, fuera de vista.
**Fix aplicado** (CRONOMETRO y luego el mismo patrón en INSECTOS):
- `.crono-layout`/`.panel-3col` → `align-items: start` (las columnas ya no se estiran a la altura de la más larga)
- `.ranking-card` → `height: calc(100vh - 210px)` (altura real basada en viewport, no `100%` ambiguo) + `overflow-y:auto` interno para que la lista larga scrollee dentro de su propia caja, no empuje la página
- `.col-crono`/columnas centro-derecha en INSECTOS → `position: sticky; top: 174/180px` como respaldo extra, con override para `body.fs-activo` (pantalla completa, header oculto)
- Mobile (`max-width:1200/1100px`): se mantiene el comportamiento apilado original con scroll de página completa (no scroll interno), pero con `.col-crono`/participante-strip sticky para que no se pierdan al bajar por la lista larga
- **Regresión encontrada y corregida**: el `overflow-y:auto` + `max-height` en las columnas sticky de INSECTOS (centro/derecha) rompía los clics en pantalla completa (ej. botón DNF de carril 1 no respondía). Esas columnas son cortas y fijas (2x2 carriles + cronómetro), no necesitaban scroll interno — se les quitó `overflow-y`/`max-height`, dejando solo `position:sticky` puro. Fix confirmado en vivo por Raku.

### INSECTOS — bug real: DNF marcado como finalista (tiempo 0 tratado como "el más rápido")
**Síntoma**: en clasificatoria, 4 robots que en realidad no completaron la pista salieron como los 4 clasificados a la final, mostrando "MEJOR CLAS: 00:00:00".
**Causa raíz**: `registrarTiempoCarril()` (botón verde "✓ TIEMPO") no verificaba si el cronómetro del grupo se había iniciado — si se presionaba antes de dar "Iniciar", registraba `ms = 0` sin avisar. Como 0 es "el tiempo más rápido posible", esos robots ganaban la clasificación aunque nunca corrieron. Bug secundario de visualización: el panel "📊 RANKING CLAS." usaba `!r.tiempo` (chequeo de verdad) en vez de `r.tiempo === null`, por lo que un tiempo de 0 se mostraba como "DNF" ahí mismo mientras la lógica real SÍ lo contaba como tiempo válido — inconsistencia confusa.
**Fix**: `registrarTiempoCarril()` ahora, si el cronómetro no se ha iniciado, muestra un `alert()` y NO registra nada (ya no hay opción de "registrar de todas formas") — aplica tanto al clic manual como a una señal del sensor llegada antes de iniciar. `registrarDNFCarril()` (clic manual, no el flujo `auto` de "DNF TODOS"/timeout) tiene el mismo guard. Bug de visualización corregido con `=== null`.
**Reversión parcial pedida por Raku**: el bloqueo de señales del sensor antes de iniciar (para clasificatoria) se agregó y luego se **deshizo explícitamente** — la causa real de activaciones fantasma era ruido eléctrico de un capacitor cambiado en el hardware (no un bug de software), y una vez resuelto físicamente, Raku prefirió quitar esa fricción extra. Queda solo el `confirm()`/`alert()` del clic manual.
**Ranking parcial — "DNF" por defecto a quien no ha corrido**: `rankingClas()` ahora distingue "sin intentos" (nunca corrió, se muestra "—" tenue) de "DNF real" (corrió y no terminó, rojo). Antes mostraba "DNF" a todos por defecto desde el inicio, confundiendo con quienes de verdad fallaron.

### INSECTOS — polling de `activo` reseteaba a Intento 2 solo (Trepador)
**Síntoma**: justo al detenerse el cronómetro por el sensor (Trepador), sin presionar nada, el badge cambiaba a "Intento 2 de 2" y el reloj volvía a 00:00.
**Causa raíz**: el polling de 2s que revisa si hay un participante nuevo escaneado se bloqueaba solo mientras `cronoInterval` estaba activo. Al detenerse el cronómetro (STOP del sensor), ese bloqueo desaparecía — y si en ese instante la hoja `activo` traía una marca más nueva para el MISMO participante (ej. otra pestaña/dispositivo tocando el escáner), el código lo volvía a "recibir" como si fuera un escaneo nuevo, recalculando el intento a partir de lo ya guardado.
**Fix**: mientras se espera confirmación (`esperandoConfirmacionIntento`), el polling ignora cualquier dato del mismo participante aunque llegue con marca más nueva. Solo reacciona a un participante genuinamente distinto.

### INSECTOS — ronda FINAL: de "intento único" a "mejor de 2 intentos"
Reescrita para que la FINAL funcione igual que CRONOMETRO (mejor de 2 intentos, no 1 intento único):
- Nuevo estado: `intentosFinal[id]` (array de hasta 2 intentos por robot) + `turnoFinalActual` (0/1) + `mejorFinalDe(id)` que calcula el mejor tiempo válido entre ambos.
- `tiemposFinal[id]` se sigue usando como el "resultado oficial" (compatibilidad con podio/GAS/ranking, que ya leían ese objeto) pero ahora se recalcula como el MEJOR de los intentos en vez de fijarse en el primero.
- Botón dinámico: "Siguiente intento →" tras el intento 1, cambia a "VER PODIO →" tras el intento 2. Labels dinámicos "INTENTO 1/2 DE 2".
- `autoDNFResto(true)` (DNF TODOS / timeout) adaptado a registrar DNF por turno, no de forma permanente.
- Mismo guard de "no registrar sin Iniciar" que clasificatoria (con `prompt()` de tiempo manual si no hay cronómetro, patrón que la FINAL ya tenía y clasificatoria no).

### INSECTOS/CRONOMETRO — Web Serial: una sola conexión para clasificatoria y FINAL
**Síntoma**: al pasar de clasificatoria a la FINAL, aunque el Arduino ya estaba conectado, salía "Sensor no conectado" pidiendo reconectar.
**Causa raíz**: clasificatoria y FINAL usaban conexiones Web Serial completamente separadas (`serialPort`/`serialReading` vs `serialPortF`/`serialReadingF`), cada una con su propio botón "Conectar".
**Fix**: unificada a una sola conexión compartida. El lector (`leerSerial()`) despacha cada línea a clasificatoria o final según cuál panel esté activo (`document.getElementById('panel2').classList.contains('active')`). Los botones Conectar/Desconectar de ambos paneles controlan/reflejan la misma conexión (`actualizarSerialUIAmbos()`). Las funciones/variables `conectarSerialF`/`leerSerialF`/`serialPortF` quedaron sin usar (no se eliminaron las declaraciones para minimizar riesgo, pero no se llaman).

### INSECTOS clasificatoria — botón "↻ Reiniciar tiempo"
Nuevo botón junto a DETENER. A diferencia de lo que se asumió al principio, Raku confirmó que **sí debe borrar** los tiempos/DNF ya registrados de los 4 robots del grupo/turno actual (no solo resetear el cronómetro a 02:00) — recalcula `mejores[id]` tras el borrado y refresca las tarjetas en blanco.

### Arduino Insectos — sensor quemado, voltaje 10V, cambio de pin A2→A5 (y reversión)
Diagnóstico de hardware (no software): un sensor Sharp GP2Y0A21 se quemó, midiendo 10V en la línea (debía ser 5V) — indica fuente/regulador de 5V dañado, probablemente relacionado con un capacitor cambiado que empezó a dar ruido. Se movió el carril 3 de A2 a A5 en ambos sketches (diagnóstico y producción) mientras se reparaba. **A4/A5 en Arduino Uno tienen resistencias pull-up de fábrica pensadas para I2C** — pueden dar lecturas más ruidosas/inestables que otros pines analógicos si se usan para sensores normales; si un carril específico falla repetidamente y los demás no, sospechar primero del pin/hardware antes que del código. Una vez reparado el capacitor (causa real del ruido), Raku revirtió el pin de A5 de vuelta a A2.

### GENERAR-CERTIFICADOS / `shared/js/certificados.js` — rediseño de plantilla
- **Texto de logro dividido en 3 líneas**: antes una sola oración ("Por haber obtenido el **PRIMER LUGAR** en la categoría..."); ahora `{{TEXTO_LOGRO_CHICA}}` ("Por haber obtenido el", itálica chica) → `{{TEXTO_LOGRO_GRANDE}}` ("PRIMER LUGAR"/"SEGUNDO LUGAR"/"TERCER LUGAR", grande/dorado, SIN "EL") → `{{TEXTO_LOGRO_RESTO}}` (categoría + resto, como antes). `obtenerTextoLogro()` devuelve `{chica, grande, resto}`.
- **Logo del Club sin fondo blanco**: `club-robotica-fondo-blanco.png` tenía un fondo blanco horneado en el PNG (rectángulo con esquinas redondeadas, no transparente completo). Se generó `shared/images/club-robotica-transparente.png` (remoción de fondo con PIL, rampa de alfa suave 225-250 para bordes limpios) y `certificados.js` (`LOGO_CLUB`) apunta a ese archivo nuevo — el original no se tocó por si otra página lo necesita con fondo.
- **Logos más grandes**: club 62px → 82px → 108px; Sucre 70px → 92px → 122px (2 rondas de ajuste a pedido de Raku).
- **Auspiciantes**: se confirmó que los 15 auspiciantes actuales de `auspiciantes.js` ya estaban completos en `CERT_SPONSORS_RIGHT` — no faltaba ninguno.
- **Categorías reales para diplomas** (ojo, error cometido y corregido en esta sesión): las 13 categorías son las de `CATEGORIA_MAP`, en particular **Minisumo Autónomo** y **Minisumo RC** — NO "Minisumo Autónomo Amateur/Pro" (nombre que se usó por error al generar un lote de diplomas de prueba y hubo que regenerar).
- **Pipeline de prueba usado**: reproducción standalone del template real (HTML+CSS extraído literalmente de `certificados.js` vía regex) + Playwright (Chromium headless) → `page.pdf()` landscape A4, para generar diplomas de prueba fieles sin depender del navegador de Raku. Útil para iterar diseño rápido antes de tocar el sitio en vivo.

### Respaldos de papel — Soccer (edición) y Minisumo RC (nuevo, 21 participantes)
- **Soccer** (`SucreBot2026_Soccer_Llaves15_Papel.docx`, ya existente): intercambio de grupo Dio Sabra (Grupo A) ↔ ATOM X (Grupo C), incluyendo institución, en tabla de participantes + calendario de partidos + tabla de posiciones de ambos grupos. Editado con `python-docx` directo sobre el archivo que subió Raku (no regenerado desde cero) para preservar formato exacto; verificado que no afectó a Niupi FC/ZeusBot (comparten institución con los equipos movidos).
- **Minisumo RC** (`SucreBot2026_MinisumoRC_Llaves21_Papel.docx`, nuevo): 21 participantes → formato de **eliminación directa** (no todos-contra-todos, porque n≥7 usa el patrón de rondas sucesivas con BYE hasta quedar 2 → FINAL, por la tabla de `BRACKET GENERAL` de este mismo SKILL). Estructura: Ronda 1 (10 combates+BYE) → Ronda 2 (5+BYE) → Ronda 3 (3) → Semifinal (1+BYE) → Final (1) → Podio, con nota de que el 3er lugar se define manualmente (`podio_manual`, este formato no genera partido de 3ro automático). Todos los cruces quedan en blanco para llenar a mano el día del evento (se sortean, igual que Ronda 2+ del de Autónomo). Generado con `python-docx` replicando el estilo visual (colores, fuentes) del resto de plantillas de respaldo.
- **Lista de 21 de Minisumo RC**: Raku pasó 22 nombres con "Blanck Noir" y "Black Noir" muy seguidos (probable typo/duplicado); se asumió que es el mismo robot y se dejó solo "Blanck Noir" — **pendiente confirmar con Raku** si en realidad son 2 robots distintos (en ese caso son 22, no 21, y cambia la estructura de rondas).

### Nota de proceso — no hay acceso directo a Google Apps Script ni al Sheet de participantes
Intentado en esta sesión: `web_fetch`/`bash_tool` a `script.google.com` (no está en la lista de dominios permitidos de ninguna de las dos herramientas) y `Google Drive:search_files` buscando la hoja de participantes (no aparece — no está compartida explícitamente con la cuenta conectada, o el Drive conectado no es el mismo dueño del Sheet). **Conclusión**: para cualquier dato que solo vive en la hoja de Google Sheets (participantes, resultados en vivo, etc.), hay que pedírselo a Raku directamente — no hay forma de leerlo por herramientas.

---

## Sprint 10 jul 2026

### IMPACTO TECNOLÓGICO — Cierre de inscripciones
Mismo patrón que Lego Kids (03 jul 2026), aplicado a la segunda categoría cerrada:
- `Code.gs`: `CATEGORIAS_CERRADAS = ['Lego Kids', 'Impacto Tecnológico']` — Raku confirmó que ya lo pegó en script.google.com, implementó nueva versión y pasó el Deployment ID (`AKfycbzxYGbW35VJGr9TtCfTTIxsSouKl87xivATUQUNYYjExKP7TcubUsYr8a7V08Dey8ndBw`). `config.js` actualizado y commit/build de Pages confirmado.
- `REGISTRO/index.html`: option `disabled` con label "Impacto Tecnológico (AGOTADAS)"; tarjeta "🔬 Impacto Tecnológico — Inscripciones agotadas" agregada al panel de precios (desktop y móvil, junto a la de Lego Kids).
- **Mejora aplicada al mecanismo compartido (beneficia a ambas categorías):** el aviso rojo bajo el select (`#categoriaCerradaWrap`) y el toast de validación defensiva en `registrarParticipante()` antes tenían el texto de "Lego Kids" hardcodeado. Ahora son dinámicos: `onCategoriaChange()` escribe el nombre real de la categoría cerrada en `<strong id="categoriaCerradaNombre">`, y el toast arma el mensaje con la variable `categoria` en vez de un string fijo. Esto deja el mecanismo listo para cerrar una tercera categoría en el futuro sin tocar el HTML del aviso.
- **Principio (reafirmado):** todo bloqueo de negocio se valida en `Code.gs`, nunca solo en frontend — mismo hueco que existía con Lego Kids antes del fix backend ya estaba cerrado, así que esta vez el fix backend se aplicó desde el inicio junto con el frontend.

### Deploy — GitHub Pages inestable
Patrón recurrente esta sesión: el primer intento de `POST /pages/builds` frecuentemente termina en `conclusion: failure` en el job "Deploy to GitHub Pages" (el job "build" sí termina bien). Causa exacta no confirmada — a veces coincide con commits automáticos concurrentes del GAS (`publicarJSON()` corriendo mientras Raku prueba en vivo), a veces no.

**Mitigación:** reintentar el `POST /pages/builds` 1-2 veces más suele resolverlo. **Siempre verificar con `GET /pages/builds/latest`** que el campo `commit` coincide con el SHA recién subido antes de avisar "listo" — el estado puede quedar reportando `built` sobre un commit viejo aunque haya un build más nuevo encolado o fallado.

**Nota de red:** `github.io` no está en la lista de dominios permitidos para `bash_tool`/`web_fetch` — verificar el contenido publicado usando `raw.githubusercontent.com` (si está permitido) o la API de builds, nunca asumir que un fetch fallido a `github.io` significa que el deploy no sirvió.

---

## Common Bugs & Fixes

1. CORS error → `Content-Type: text/plain;charset=utf-8`
2. `{ ok: false, error: 'No autorizado' }` → staffToken faltante
3. DEPLOYMENT_ID mismatch → `console.log(CONFIG.GAS_URL())`
4. `config.js` cargado en `<head>`
5. `body { padding-top: 0 !important }` + `main { padding-top: 174px }`
6. Paths usan `../shared/` no `/shared/`
7. Quote collision en `onclick` → usar `data-*` + `addEventListener`
8. `driveId` debe ser file ID de `.../file/d/FILEID/view`
9. `bracket_general` col B = categoria — siempre filtrar por categoria al leer
10. Instituciones dropdown vacío → `localStorage.removeItem('sucrebot_instituciones_cache')`
11. Web Serial fragmentado → `decoder.decode(value, { stream: true })` + `.replace(/\r/g, '')`
12. Nunca enviar `'F'` al ESP32 al conectar
13. **Bracket con BYE_PENDIENTE** → normalizado a FINALIZADO tipo BYE en frontend
14. **Soccer no carga** → verificar que llama `getSoccerTorneo` y no `getBracketGeneral`
15. `SyntaxError: Identifier 'GAS_URL' has already been declared` → usar `CONFIG.GAS_URL()` inline
16. **INSECTOS tiempos como "—"** → usar `fmtMsGAS()` formato `HH:MM:SS`
17. **PANTALLA CSS conflicts** → siempre usar `!important` en `#fsOverlay` CSS, único bloque al final del HTML
18. **PANTALLA grid vacío** → `buildGrid` llamada antes del DOM listo → usar `setTimeout(..., 0)` + `setTimeout(..., 800)` como fallback
19. **PANTALLA fullscreen no cubre** → verificar que solo hay UN `#fsOverlay {` en el CSS
20. **MANILLAS cards vacías** → `CAT_COLOR` no definido antes de `renderLista()` → `ReferenceError` rompe todo el render
21. **Template literal con concatenación `+`** → genera HTML malformado; calcular string fuera del backtick
22. **Fullscreen con scrollbar visible** → agregar `document.body.style.overflow='hidden'` en `abrirFS()`
23. **REGISTRO encoding roto (`Ã`, `Â`)** → reconstruir con `create_file` desde contenido limpio. Verificar `content.count('Ã') == 0`
24. **enviarQR con modoRevision** → `modoRevision: true` llama `reenviarRevision(id)` en GAS
25. **Criterios dev/bai viejos en GAS** → limpiar con `gasPost({action:'guardarCriterios', categoria:'dev', criterios:[...]})` desde consola
26. **PANEL-CALIFICACION: juez incorrecto en notas** → `state.calificacionesPorJuez[id][juezEmail]` guarda notas por juez; al seleccionar robot cargar del juez activo, no del último que guardó
27. **PANEL-CALIFICACION: `siguienteRobot` ignora juez** → para `esMultiJuez(cat)` filtrar pendientes por `getJuezActivo(cat).email`
28. **Template literals con comillas en CSV** → usar concatenación `'\"' + val + '\"'` en vez de backtick con `${}`
29. **RESULTADOS bracket no aparece tras F5** → `localStorage.removeItem('sucrebot_res_cache')` + recargar
30. **RESULTADOS bracket desaparece tras resetear** → resetear borra Sheet pero `publicarJSON` se activa por otras acciones; solución: `guardarPodioManual` con `posiciones:[]` ya no llama `publicarJSON`
31. **PANEL-BRACKET minisumo: puntos sin iniciar asalto** → botones bloqueados con `ms.fase !== 'corriendo'`
32. **PANEL-BRACKET minisumo: cronómetro se detiene al cambiar pestaña** → usar `Date.now()` en vez de `setInterval` puro
33. **PANEL-BRACKET bracket viejo en pantalla** → resetear desde PANEL-BRACKET (no manualmente desde JSON)
34. **RESULTADOS TCV sin podio** → calcular tabla localmente desde partidos del TCV
35. **RESULTADOS 3er lugar no aparece** → leer `datosJSON.podio_manual[ruta]` posición 3 como fallback
36. **pollJSON no rerenderiza** → `actualizarVista()` siempre se llama independiente del ts
37. **Marcador de soccer guardado como fecha ISO** → Sheets autodetecta tipo; SIEMPRE `setNumberFormat('@')` antes de `setValue()` para cualquier string libre que pueda parecer fecha (ej. "3-4", "5-2")
38. **`toast is not a function` en MANILLAS** → esa página usa `showToast(msg, esError)`, no `toast(msg, tipo)` — verificar el nombre real de la función de notificación antes de copiar patrones de otras páginas
39. **Excel exporta vacío pese a haber datos en pantalla** → verificar la key real de localStorage (ej. MANILLAS usa `'participantes'`, no `'sucrebot_manillas_cache'`) o leer directo de `state.*` si el dato ya está en memoria
40. **Cronómetro de soccer se atrasa/congela al cambiar de pestaña** → mismo patrón que tenía Minisumo: migrar de `setInterval` con decremento puro a `Date.now()` + timestamp de inicio guardado en el estado
41. **Sensor de un cronómetro (Trepador) necesita varias pasadas para detectar** → primero descartar bug de software (revisar si el LED que queda prendido es del ESP32 o del sensor mismo); si es la luz propia del sensor, es calibración física (potenciómetro/alineación), no código
42. **`Uncaught NetworkError: The device has been lost` en consola** → `pipeTo()` de Web Serial sin `.catch()`; agregar `.catch(()=>{})` a los pipeTo de lectura y escritura
43. **Bloqueo de categoría/negocio no se respeta pese al frontend actualizado** → validar SIEMPRE también en `Code.gs`; el frontend puede quedar cacheado en una pestaña vieja del usuario
44. **Animación CSS infinita "salta" o "regresa" al reanudar tras una interacción manual (drag)** → nunca animar de vuelta a un punto fijo; calcular la posición normalizada (`% distancia` si el elemento está duplicado) y usar `animation-delay` negativo para continuar sin salto
45. **Botones que comparten clase CSS rompen `querySelector` al cerrar/togglear** → si dos botones necesitan el mismo estilo pero distinta lógica de toggle, usar clases separadas (ej. `btn-reg-preview` vs `btn-reg-preview-pista`)
46. **Modo offline: bloquear categoría exige GAS incluso sin internet** → buscar TODOS los puntos que llaman a `bloquearCategoria`/`desbloquearCategoria` (inicio, cierre, restauración de sesión al recargar), no solo el más obvio — un solo punto sin cubrir bloquea todo el flujo offline con un error
47. **Ranking/podio de categorías con múltiples jueces simultáneos NO se puede calcular offline** → `CATS_MULTI_JUEZ` (dev, bai, lk) usa 2-3 dispositivos separados; un solo dispositivo offline no ve las calificaciones de los otros jueces. Bloquear la acción explícitamente con mensaje claro, no intentar un cálculo local que sería incorrecto
48. **Service Worker debe vivir en la raíz del repo, no en `shared/`** → el scope por defecto es el directorio del archivo; si `sw.js` está dentro de `shared/`, no puede controlar `CRONOMETRO/`, `INSECTOS/`, etc.
49. **Gap en rango de fechas de precios (`.precio-periodo`)** → el texto visual y la lógica JS de fecha activa (`periodos` array con `desde`/`hasta`) son DOS cosas separadas que hay que actualizar juntas; un cambio de texto sin tocar las fechas del array deja el badge "ACTIVO" sin aparecer en ningún precio
50. **PAT de GitHub no persiste entre conversaciones** → cada chat nuevo requiere que Raku lo vuelva a pegar (el entorno de sandbox se resetea); dentro de la MISMA conversación sí se puede reutilizar sin volver a pedirlo en cada mensaje, si Raku lo prefiere así
51. **`reiniciarCrono()` no rearmaba el sensor de Seguidor de línea** → el ESP32 (igual que Cubo Rubik) queda en estado "no escucha" (`listo=false`) tras cada STOP y necesita recibir `'R'` de nuevo. El botón "↻ Reiniciar" solo reenviaba `'R'` para `CATS_PULSADOR`, no para `CATS_SEG` — funcionaba una vez (armado al elegir participante) y luego el sensor dejaba de detectar tras reiniciar. Reproducía igual en online y offline (confirma que es lógica de JS/serial, no algo del módulo offline). **Diagnóstico útil**: para descartar hardware vs software sin ver el código, revisar si el LED que queda prendido/apagado es el del ESP32 (controlado por firmware) o el del sensor mismo (indicador físico del E18-D80NK) — son cosas distintas y fáciles de confundir. Fix: `if(CATS_PULSADOR.includes(categoriaActual)||CATS_SEG.includes(categoriaActual))enviarSerial('R');` — corregido y confirmado en vivo (online + offline) 07 jul 2026.

---

## Key Learnings & Principles

- **Deployment ID discipline**: siempre verificar `console.log(CONFIG.GAS_URL())`
- **GAS syntax errors son silenciosos**: validar balance de llaves antes de desplegar
- **CSS cascade en componentes compartidos**: renombrar clases internas o usar `!important`
- **GAS CORS**: siempre `Content-Type: text/plain;charset=utf-8`
- **Drive file IDs**: extraer de `.../file/d/FILEID/view`
- **Code.gs nunca debe tocar GitHub**
- **localStorage sesión staff intocable**: `sucrebot_user` y `sucrebot_staff_token`
- **Generación progresiva de fases**: GAS genera cada ronda al terminar la anterior; TCV y FINAL son terminales
- **BYE_PENDIENTE vs BYE**: BYE_PENDIENTE = ronda aún no terminó; BYE = partido ya propagado
- **Soccer tiene su propio stack**: hoja `soccer_torneo`, acciones GAS propias
- **INSECTOS: getParticipantes es GET**: usar `fetch(GAS_URL + '?' + new URLSearchParams(...))`
- **PANTALLA reconstrucción**: siempre cortar en `<!-- FULLSCREEN -->`, construir base limpia + tail, verificar con `node --check`
- **textContrast()**: función reutilizable para texto legible sobre cualquier color
- **MANILLAS CAT_COLOR**: definir siempre ANTES de `renderLista()`
- **REGISTRO encoding**: nunca parchear desde el repo si ya hay corrupción — usar `create_file`
- **Correo de revisión (EN REVISIÓN)**: `enviarQR` con `modoRevision: true` → llama `reenviarRevision(id)`
- **GitHub upload directo desde Python**: siempre usar urllib.request PUT con SHA
- **PANEL-CALIFICACION multi-juez**: cada juez tiene email único → GAS no tiene conflictos
- **bai_final en GAS**: ronda final de Bailarín se guarda como `categoria: 'bai_final'`
- **Minisumo cronómetro**: usar `Date.now()` + `ms._tsInicio` para resistir throttle de pestaña en segundo plano
- **Minisumo puntos**: son por asalto (se reinician), no acumulados entre asaltos
- **guardarPodioManual posiciones vacías**: no llama publicarJSON para no borrar bracket del JSON publicado
- **pollJSON siempre rerenderiza**: `actualizarVista()` fuera del `if (nuevoTs !== ultimoTs)` para que `pollJSON()` manual funcione
- **Sheets autodetecta tipo de dato en `setValue()`**: cualquier string que matchee un patrón de fecha/número se corrompe silenciosamente; `setNumberFormat('@')` ANTES de `setValue()` es la defensa estándar (aplicado a contacto, marcadores de soccer)
- **Nombre de función de notificación varía por página**: `toast()` en la mayoría, `showToast(msg, esError)` en MANILLAS — siempre confirmar antes de reusar código
- **Key de localStorage no siempre es "lógica"**: verificar el nombre real (`grep CACHE_KEY` o similar) en vez de asumir convenciones de nombre
- **Todo cronómetro debe basarse en `Date.now()`**: el patrón correcto es guardar timestamp de inicio + segundos al iniciar, calcular restantes en cada tick — nunca decrementar un contador dentro de `setInterval` directamente (afecta Minisumo y Cronómetro Soccer; revisar Combate Batalla si reaparece el síntoma)
- **Reglamento como fuente de verdad**: al recibir un .docx de reglamento, extraer texto con `extract-text` y cruzar artículo por artículo contra el HTML/JS del panel correspondiente antes de hacer cambios — no asumir que el sistema ya cumple solo porque "se ve razonable"
- **Luz de sensor propia vs LED controlado por microcontrolador**: si el LED que se queda encendido/atascado es el integrado en el sensor físico (no uno soldado y controlado por el ESP32), el problema casi siempre es calibración/alineación física, no lógica de software
- **Validación de negocio (categorías cerradas, cupos, fechas)**: siempre en `Code.gs`, nunca solo en el frontend — una pestaña vieja abierta en el navegador del usuario ignora cualquier bloqueo agregado solo en JS del cliente
- **Reanudar animaciones CSS infinitas tras interacción manual**: usar `animation-delay` negativo calculado sobre la posición normalizada, nunca animar de vuelta a un punto fijo (se ve como que "regresa" y rompe la sensación de continuidad)
- **Clases CSS compartidas entre botones con distinta lógica de toggle**: causan bugs sutiles en `querySelector` al cerrar/actualizar texto — dar clases separadas aunque el estilo visual sea idéntico
- **Verificación de deploy de GitHub Pages**: no confiar en un solo intento de `POST /pages/builds`; siempre comparar el `commit` de `GET /pages/builds/latest` contra el SHA recién subido antes de confirmar "listo" al usuario — reintentar si no coincide o si `conclusion` fue `failure`
- **Modo offline — envolver, no duplicar**: la estrategia ganadora fue envolver las mismas llamadas GAS existentes con una cola local (Excel), no reconstruir la lógica de negocio en un sistema paralelo — mucho menor riesgo y esfuerzo
- **Modo offline — no todo módulo es igual de seguro de replicar**: CRONOMETRO/INSECTOS (un solo dispositivo, todo se calcula localmente) son seguros; PANEL-CALIFICACION solo es seguro para la calificación individual, no para el podio final (multi-juez); PANEL-BRACKET no es seguro en absoluto (lógica de bracket vive en el servidor) — evaluar esto ANTES de prometer una solución offline completa
- **Service Worker con estrategia "red primero"**: preserva el comportamiento online exactamente igual (0 riesgo de servir contenido viejo mientras hay internet); el caché es un efecto secundario invisible que solo se usa si la red falla
- **REGLAMENTO — patrón `pistaImg`**: campo opcional en el array `CATEGORIAS`; los botones "Descargar/Ver Pista" ya son genéricos (`cat.pistaImg ? ... `). Para agregar pista a otra categoría: convertir PDF→PNG con `pdftoppm -r 150` + `Image.quantize(colors=32, method=Image.FASTOCTREE)`, subir a `shared/images/pistas/`, agregar el campo. Para ocultar sin perder el archivo: quitar solo el campo `pistaImg` de esa categoría (la imagen queda en el repo por si se reactiva)
- **REGISTRO — rangos de fecha de precios**: el array `periodos` (JS) determina qué tarjeta muestra "ACTIVO"; agregado también estado "vencido" (opacidad + tachado + badge gris "FINALIZADA") para tarjetas de precio con `hasta` ya pasado — evita que una promoción vencida se vea como vigente solo por falta de badge
- **`github.io` no está en la allowlist de red del sandbox**: usar `raw.githubusercontent.com` o la API de contenidos/builds para verificar cambios publicados, no asumir que un fetch fallido a `github.io` significa que el sitio no se actualizó
- **Bloquear la UI de origen durante una transición async entre pantallas**: si un flujo pasa de pantalla A a pantalla B tras una operación async (fetch, verificación), un clic de más en A puede terminar cayendo sobre un elemento de B que aparece en la misma posición — la UI de origen debe deshabilitarse (`pointer-events:none` + guard booleano) mientras la operación está en curso, no solo mostrar feedback visual
- **Reutilizar la lógica de avance de fase existente al extender formatos de torneo (Soccer)**: al agregar un nuevo tamaño de torneo, si la nueva estructura de grupos coincide con un patrón ya implementado (ej. "2 grupos, final directa, 3ro por estadísticas" = mismo patrón que `GRUPOS_8`), agregar el nuevo formato a la condición `if` existente en vez de escribir un bloque nuevo — `calcularTablaSoccer`/`calcularPodioSoccerHelper` ya son genéricos y no necesitan tocarse
- **No asumir la estructura de un nuevo formato sin confirmar con el cliente**: el borrador inicial para 14 equipos (3 grupos) fue incorrecto — Raku especificó una estructura distinta (2 grupos de 7) que resultó ser más simple de implementar (reutiliza `GRUPOS_8` en vez de crear una variante de `GRUPOS_9-12`)
- **Avisar de trade-offs antes de implementar, sin bloquear la decisión del cliente**: un formato de 2 grupos de 7 implica 43 partidos totales — se le avisó a Raku el volumen antes de escribir el código, pero se implementó tal como lo pidió una vez confirmado
- **Filtros de UI puramente organizativos vs. control de acceso real**: el filtro de grupo en PANEL-BRACKET (para repartir jueces por pista) es solo una preferencia de visualización guardada en `localStorage` por dispositivo — no es una restricción de permisos; cualquier dispositivo puede cambiar de filtro y jugar cualquier partido si hace falta
- **Gates de "próximamente" para páginas públicas**: patrón reutilizable — constante booleana + comparación contra `localStorage.getItem('sucrebot_staff_token')`, ocultando el contenido real con `display:none` (nunca removiendo el DOM, para no romper `getElementById(...).innerHTML` del resto del script) y superponiendo un overlay de aviso. Mismo mecanismo ya usado en el modal de INICIO (con fecha de expiración automática) y en el gate de RESULTADOS (con activación manual pendiente de aviso de Raku)

---

## Approach & Patterns

- Archivos completos listos para copiar — sin diffs parciales, sin placeholders
- Para archivos grandes con encoding issues: Python con `latin-1` fallback y `content.replace()` vía heredoc
- **Parchear REGISTRO u otros HTML con historia de corrupción**: usar siempre `create_file` con el contenido original limpio
- Verificar JS con `node --check /tmp/test.js` antes de subir a GitHub
- Bugs visuales se comunican con capturas; Claude identifica causa raíz y aplica fix dirigido
- **Subir a GitHub directo desde Python** (`urllib.request` PUT) — evita problema de caché del navegador

---

## Tools & Resources

- **Frontend**: GitHub Pages, HTML/CSS/JS, componentes compartidos vía `load-components.js`
- **Backend**: Google Apps Script, Google Sheets, Google Drive
- **Hardware**: Arduino Uno + sensor IR (Insectos), Arduino con pulsadores (Cubo Rubik), ESP32 (Trepador/Seguidor)
- **QR generation**: `api.qrserver.com`
- **Logos**: `https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/`
  - `club-robotica-fondo-blanco.png` (fondo blanco, usar sobre fondos blancos)
  - `logosucre.png` (fondo transparente)

---

## Pending Tasks (actualizado 07 julio 2026 — noche)

### Modo Offline / Service Worker — seguimiento
- [ ] Probar INSECTOS en vivo (offline completo: crear archivo → cortar internet → cronometrar → guardar podio → sincronizar) — construido pero no probado en vivo aún, a diferencia de CRONOMETRO
- [ ] Probar el Service Worker en vivo (recargar página con internet cortado) en los 3 módulos donde se agregó
- [ ] Decisión pendiente: ¿extender el Service Worker al resto del sitio (REGISTRO, INICIO, etc.) o dejarlo solo en los 3 módulos actuales?
- [ ] Antes del evento: cada dispositivo de staff (CRONOMETRO/INSECTOS/PANEL-CALIFICACION) debe presionar "🆕 Crear archivo offline" al menos una vez CON internet, y guardar el .xlsx en un lugar reconocible (esto registra también el Service Worker)
- [ ] Comunicar al equipo la regla operativa de PANEL-CALIFICACION: si se corta la luz, calificar offline sin problema, pero "Guardar Podio" solo debe presionarse cuando TODOS los jueces de esa categoría ya sincronizaron con internet
- [ ] PANEL-BRACKET: definir/imprimir la plantilla de respaldo en papel antes del evento (decisión: sin Excel local para este módulo)

### RESULTADOS — pendiente crítico antes del evento
- [x] **Activar `RESULTADOS_ABIERTO_AL_PUBLICO = true`** — confirmado activo en el código real, 19 jul 2026

### Admin / Security
- [ ] Rotar `GITHUB_TOKEN` expuesto — **CRÍTICO**
- [ ] Hacer privado el repositorio de GitHub
- [ ] Remover lista de staff emails de `config.js` público
- [ ] **Backend no valida el staff token en ninguna acción** — hallazgo del 19 jul, incluye acciones destructivas como `eliminarParticipante`. La constante `STAFF_TOKEN_VALUE` recién se agregó (solo la usa la acción nueva `republicarJSON`); falta aplicarla al resto de acciones no públicas

### Pendientes post-evento — sprint 19 jul 2026
- [ ] Confirmar con Raku si corresponde corregir los certificados de RAMBOT (GANADOR) y Yarbot (SUBCAMPEÓN) en Seguidor Pro — no tienen corrida de ronda final registrada, todo indica que Shippu/Rb26/XLRbot son el podio real
- [ ] PeakRunner (Trepador Amateur, 3er lugar real) — falta su tiempo de ronda final en la hoja `resultados`, mismo caso que tenía RAMBOT
- [ ] Revisar si el "todos contra todos" ya jugado de Minisumo Autónomo (Axebot/Kitsune/Kachetes 2.0) tiene el resultado Axebot-vs-Kitsune cargado al revés (Axebot aparece ganador de los dos combates, pero Raku indicó que Kitsune debería haber ganado el general)
- [ ] Confirmar si hace falta limpiar manualmente las filas duplicadas viejas en la hoja `certificados` (la dedup de `calcularRankingInstituciones` ya neutraliza el efecto en el ranking, pero las filas siguen ahí)

### Code.gs — pendientes de pegar en script.google.com
- [x] **CATEGORIAS_CERRADAS (Lego Kids + Impacto Tecnológico)**: confirmado por Raku — pegado en script.google.com, nueva versión implementada, Deployment ID `AKfycbzxYGbW35VJGr9TtCfTTIxsSouKl87xivATUQUNYYjExKP7TcubUsYr8a7V08Dey8ndBw` actualizado en `config.js` y deploy de Pages verificado — 10 jul 2026
- [ ] Fix de marcador de soccer como texto (`setNumberFormat('@')`) — confirmar si ya se aplicó en script.google.com (entregado en sprint 29 jun)

### CRONOMETRO
- [ ] Validar en vivo, con robot real (no solo mano), que el handshake ARMED de Trepador funciona bien tras la recalibración del sensor
- [ ] Repetir la calibración del E18-D80NK en el resto de sensores de Trepador si hay más de un ESP32 armado para esa categoría

### PANTALLA
- [ ] Agregar overrides de `#fsOverlay` al `shared/css/styles.css` para evitar conflictos CSS futuros
- [ ] Sustituir logos reales de auspiciantes cuando estén disponibles
- [ ] Cronograma real del evento (datos reales julio 16)

### MANILLAS
- [ ] Confirmar 13º color (categoría restante) — Raku avisará
- [ ] Implementar asignación color→categoría en PARTICIPANTES_REGISTRADOS y MANILLAS

### Bracket / Soccer
- [x] Formatos de 13 y 14 equipos agregados a `Code.gs` (GRUPOS_13 estilo 3-grupos, GRUPOS_14 estilo 2-grupos) — 09 jul 2026, DEPLOYMENT_ID actualizado y confirmado
- [x] Filtro de grupo por dispositivo en PANEL-BRACKET para repartir jueces por pista (Grupo A / Grupo B / Grupo C) — 09 jul 2026
- [ ] Probar en vivo el torneo de 14 equipos con las 2 pistas simultáneas antes del evento real (generar torneo `[DEV]`, confirmar podio y 3er lugar automático)
- [ ] Resetear brackets de prueba antes del evento real
- [ ] Decisión: validación máx. 2 robots por equipo en Soccer
- [ ] Reparar manualmente cualquier marcador histórico corrompido como fecha en `soccer_torneo` (col J) generado ANTES del fix de `setNumberFormat('@')`
- [ ] Considerar aplicar el mismo patrón `Date.now()` al cronómetro de Combate Batalla (`combate`) si se reporta el mismo síntoma de atraso al cambiar pestaña
- [ ] Validar en vivo: minuto técnico, botón "sin robots funcionales", auto-descalificación en 5ª amonestación (recién implementados, sin pruebas reales con 2 dispositivos)

### REGLAMENTO
- [x] Imagen de pista agregada para Seguidor de línea ST (Amateur) — 07 jul 2026
- [x] Imagen de pista de Seguidor de línea ST (Pro) OCULTA (campo `pistaImg` removido, archivo conservado en el repo) — decisión de Raku, 07 jul 2026
- [ ] Considerar agregar imagen de pista a otras categorías que tengan pista física (Trepador, Cubo Rubik, etc.) siguiendo el mismo patrón

### Naming / UI
- [ ] Alinear "Miembro 2" → "Subcapitán" en MI-REGISTRO y PARTICIPANTES_REGISTRADOS
- [ ] Popular `driveId` de Minisumo RC en REGLAMENTOS

### Feature pendiente condicional
- [ ] Soporte multi-mesa en CRONOMETRO — solo si el volumen lo requiere

### PANEL-CALIFICACION — pendientes
- [ ] Confirmar nombres reales de los 3 jueces para bai y dev (actualmente "Juez 1/2/3")
- [ ] Probar flujo completo Bailarín 6 pasos con 3 dispositivos reales
- [ ] Probar flujo Impacto Tecnológico con 3 dispositivos reales

### Bugs corregidos — sprint 28-29 jun 2026
- ✅ PANEL-BRACKET: panel minisumo con 3 asaltos según reglamento (Expulsión/Abandono/Amonestación)
- ✅ PANEL-BRACKET: cronómetro minisumo basado en Date.now() (resiste cambio de pestaña)
- ✅ PANEL-BRACKET: puntos bloqueados hasta iniciar asalto
- ✅ PANEL-BRACKET: botón 🥉 3er lugar para brackets con FINAL sin partido de 3er lugar
- ✅ PANEL-BRACKET: presencia de jueces en PANEL-CALIFICACION (polling 10s, naranja = en uso)
- ✅ GAS: bracket n=3/5/6 → TODOS CONTRA TODOS (sin semifinal posterior)
- ✅ GAS: bracket n=7+ → rondas eliminatorias con sorteo aleatorio hasta FINAL
- ✅ GAS: guardarPodioManual con posiciones vacías no llama publicarJSON
- ✅ GAS: publicarJSON incluye podio_manual para ms_a, ms_rc, bat
- ✅ GAS: limpiarCertificadosDEV() función de utilidad
- ✅ GAS: guardarCertificado verifica duplicados (mismo nombre + categoría)
- ✅ GAS: publicarPodioCalificacion + resultados_publicados para bai/dev/lk
- ✅ RESULTADOS: bracketCache alimentado desde localStorage al cargar
- ✅ RESULTADOS: pollJSON siempre rerenderiza (actualizarVista fuera del if ts)
- ✅ RESULTADOS: podio TODOS CONTRA TODOS calculado localmente por puntos
- ✅ RESULTADOS: 3er lugar leído de podio_manual del JSON como fallback

### Bugs corregidos — sprint 29 jun 2026 (tarde/noche)
- ✅ Auditoría completa Reglamento Robot Soccer Pro vs sistema (.docx validado punto por punto)
- ✅ PANEL-BRACKET soccer: botón ⏱ Minuto técnico A/B (único por equipo/partido, pausa cronómetro)
- ✅ PANEL-BRACKET soccer: botón 🔧 Sin robots funcionales (victoria rival +2 goles, fórmula max(golesRival, golesInfractor+2))
- ✅ PANEL-BRACKET soccer: 5ª amonestación dispara confirm + descalificación automática (antes requería paso manual separado)
- ✅ PANEL-BRACKET soccer: cronómetro migrado de setInterval puro a Date.now() (mismo patrón que Minisumo)
- ✅ MANILLAS: botón "📊 Participantes Excel" (SheetJS, excluye [DEV], incluye todos los estados)
- ✅ MANILLAS: fix toast→showToast en exportarExcel
- ✅ MANILLAS: fix key de localStorage (era 'sucrebot_manillas_cache', correcta es 'participantes')
- ✅ PANEL-BRACKET soccer: botón "📊 Excel" con partidos completos + tabla de posiciones por grupo (multihoja)
- ✅ GAS: fix marcador de soccer guardado como fecha ISO — setNumberFormat('@') antes de setValue() en 3 ubicaciones (registrarResultadoSoccerHelper, cerrarAuto, aggregate IDA_VUELTA). **Pendiente que Raku lo pegue en script.google.com**

### Bugs corregidos — sprint 03 jul 2026
- ✅ CRONOMETRO: firmware ESP32 Trepador responde "ARMED" al recibir 'R' + captura línea base del sensor al armar
- ✅ CRONOMETRO: `iniciarCrono()` async espera confirmación ARMED antes de arrancar crono visual (Trepador)
- ✅ CRONOMETRO: `.catch()` agregado a los pipeTo() de Web Serial (evita NetworkError sin manejar en consola)
- ✅ Diagnóstico correcto de sensor Trepador mal calibrado (no era bug de código) — resuelto físicamente por Raku
- ✅ REGISTRO: Lego Kids cerrado en frontend (option disabled + aviso + validación defensiva)
- ✅ REGISTRO: tarjeta "Lego Kids — Inscripciones agotadas" en panel de precios (desktop + móvil)
- ✅ GAS: `CATEGORIAS_CERRADAS` bloqueando registros nuevos en `setParticipante`, permitiendo ediciones de participantes existentes. **Pendiente que Raku lo pegue en script.google.com**
- ✅ INICIO: velocidad del carrusel de auspiciantes +47%
- ✅ INICIO: fix bug "regresa al soltar" en el carrusel — reanuda con animation-delay negativo en vez de saltar a translateX(0)
- ✅ FAQ: nueva pregunta sobre subir archivos desde OneDrive/Google Drive
- ✅ REGLAMENTO: imagen de pista descargable/visible para Seguidor de línea ST (Pro)
- ✅ PANTALLA: typo "Bailaín" → "Bailarín" corregido
- ✅ PARTICIPANTES_REGISTRADOS: panel Gestionar Instituciones/Clubes ahora excluye [DEV] del conteo, igual que el resto de estadísticas

### Bugs corregidos — sprint 07 jul 2026 (plan de contingencia offline)
- ✅ CRONOMETRO: modo offline completo con Excel local (crear/abrir archivo, cronometrar, guardar podio, cerrar categoría, sincronizar, volver a modo normal) — probado en vivo de punta a punta
- ✅ CRONOMETRO: 3 puntos con bloqueo de categoría sin cubrir offline encontrados y corregidos durante pruebas en vivo (`confirmarIniciarCrono`, `confirmarCerrarCategoria`, restauración de sesión)
- ✅ SheetJS movido de CDN a autohospedado (`shared/js/vendor/xlsx.full.min.js`) para eliminar dependencia externa en modo offline
- ✅ PANEL-CALIFICACION: calificación individual offline; "Guardar Podio"/"Guardar Podio Final" bloqueados offline con mensaje explicativo (limitación real de multi-juez, no fixeable)
- ✅ INSECTOS: modo offline completo (mismo patrón que CRONOMETRO) — sin probar en vivo aún
- ✅ Service Worker (`/sw.js`, red-primero) agregado a CRONOMETRO/PANEL-CALIFICACION/INSECTOS para que las páginas carguen/recarguen sin internet
- ✅ REGISTRO: rango de precio "9 al 10 de julio" corregido a "7 al 10" (texto + lógica de fecha activa) — cerraba un hueco real donde el 7-8 de julio no mostraba ningún precio como vigente
- ✅ REGISTRO: estado visual "vencido" (opacidad + tachado + badge "FINALIZADA") para precios con fecha ya pasada
- ✅ REGLAMENTO: pista de Seguidor de línea ST (Amateur) agregada; pista de Pro ocultada (decisión de Raku)
- 🚫 PANEL-BRACKET: evaluado y descartado el modo offline (lógica de bracket vive en servidor) — queda con respaldo de papel, decisión explícita de Raku
- ✅ CRONOMETRO: `reiniciarCrono()` ahora rearma el sensor ESP32 de Seguidor de línea (Amateur/Pro) al presionar "↻ Reiniciar", igual que ya hacía con Cubo Rubik — antes solo funcionaba el primer armado, luego el sensor dejaba de detectar tras reiniciar. Confirmado en vivo con hardware real, online y offline. Commit `e8957d7`

### Bugs corregidos — sprint 08-09 jul 2026
- ✅ INICIO: modal de aviso "Registro obligatorio de asistentes CMI" — se muestra cada vez que se abre la página, con expiración automática (13 jul 2026), z-index por encima del splash de auspiciantes
- ✅ NAV: ítem "Registro de Asistentes CMI" agregado al dropdown "SucreBot 2026" (componente compartido, visible en todo el sitio)
- ✅ CRONOMETRO: mensaje de carga inmediato ("Verificando categoría...") al hacer clic en categoría, antes cubría con toast recién después de resolver `verificarBloqueo()`
- ✅ CRONOMETRO / PANEL-BRACKET / PANEL-CALIFICACION: guard anti doble-clic (`cargandoCategoria` + grilla bloqueada visualmente) — corrige bug real donde clics repetidos hacían "rebotar" de la pantalla de participantes de vuelta al paso 1
- ✅ CRONOMETRO / PANEL-CALIFICACION / PANEL-BRACKET / INSECTOS: overlay de carga unificado (logo SucreBot + spinner + texto BLANCO) — INSECTOS y CRONOMETRO no lo tenían, se agregó desde cero; PANEL-CALIFICACION/PANEL-BRACKET ya lo tenían, solo se les cambió el texto a blanco y se agregó el logo
- ✅ RESULTADOS: gate de acceso público (`RESULTADOS_ABIERTO_AL_PUBLICO`) — oculto para no-staff hasta nuevo aviso de Raku, staff logueado no ve ningún bloqueo
- ✅ GAS: Soccer — nuevos formatos `GRUPOS_13` (3 grupos, ronda de 3 ganadores, igual patrón que 9-12) y `GRUPOS_14` (2 grupos de 7, final directa + 3er lugar automático por estadísticas, igual patrón que `GRUPOS_8`) — límite máximo ampliado de 12 a 14 equipos
- ✅ PANEL-BRACKET Soccer: filtro de grupo por dispositivo (localStorage) para repartir jueces/pistas por grupo (A/B/C)

### Bugs corregidos — sprint 10 jul 2026
- ✅ REGISTRO: Impacto Tecnológico cerrado en frontend (option disabled + tarjeta "agotado" en panel de precios desktop/móvil) — mismo patrón que Lego Kids
- ✅ GAS: `CATEGORIAS_CERRADAS` ampliado a `['Lego Kids', 'Impacto Tecnológico']`, confirmado pegado y desplegado por Raku, `config.js` con nuevo Deployment ID
- ✅ REGISTRO: aviso de categoría cerrada (`#categoriaCerradaWrap`) y toast de validación defensiva pasaron de texto fijo "Lego Kids" a dinámicos (nombre real de la categoría) — mecanismo ahora reutilizable para futuros cierres

### Bugs corregidos — sprint 15 jul 2026 (recta final pre-evento) y día del evento (16 jul)
- ✅ CRONOMETRO: layout sticky corregido
- ✅ CRONOMETRO: corregida race condition donde el polling de 2s reprocesaba a un participante inmediatamente después de que el sensor se detenía (bloqueado con el flag `esperandoConfirmacionIntento`)
- ✅ CRONOMETRO/INSECTOS: ronda final de INSECTOS pasada a mejor-de-2
- ✅ INSECTOS: layout sticky de 3 columnas
- ✅ INSECTOS: distinción "—" vs DNF en los rankings
- ✅ INSECTOS: bloqueado el registro de tiempo/DNF antes de la cuenta regresiva
- ✅ INSECTOS: "Reiniciar tiempo" limpia los tiempos de todo el grupo, no solo del participante activo
- ✅ INSECTOS: conexión Web Serial unificada entre clasificación→final sin necesidad de reconectar
- ✅ INSECTOS: corregidas calificaciones falsas en 00:00:00 antes del start
- ✅ INSECTOS (hardware): capacitor defectuoso causando falsos triggers — reemplazado
- ✅ INSECTOS (hardware): sensores quemados por sobrevoltaje de 10V en pin A2 — diagnosticado y reemplazados
- ✅ INSECTOS (hardware): falsos triggers de pull-up I2C en pin A5 — diagnosticado y corregido
- ✅ REGISTRO: abierto y cerrado varias veces el día del evento vía la variable de timestamp `CIERRE_REGISTRO`
- ✅ CERTIFICADOS: 26 PDFs generados (13 categorías × 1er y 2do lugar) con Playwright headless
- ✅ CERTIFICADOS: tamaños de logo ajustados (club 108px, Sucre 122px)
- ✅ CERTIFICADOS: texto de logro dividido en 3 líneas
- ✅ CERTIFICADOS: logo del club cambiado a versión con fondo transparente (`club-robotica-transparente.png`)
- ✅ Bracket de Soccer: documento Word actualizado (intercambio de grupos Dio Sabra ↔ ATOM X)
- ✅ Bracket en papel de Minisumo RC: generado para 21 participantes, eliminación simple ("Black Noir"/"Blanck Noir" tratado como el mismo participante con typo)

### Bugs corregidos — sprint 19 jul 2026 (post-evento, migración a Claude Code)

**Contexto**: primera sesión trabajando el proyecto directamente con Claude Code en el repo local (`C:\Users\raku\Sucrebot`), migrando desde un Proyecto de claude.ai. Se armó `CLAUDE.md` + este `SKILL.md` en el repo, se resolvió la fricción de autenticación de git, y se investigó/corrigió el bug real de MANILLAS reportado del día del evento.

- ✅ **Git**: configurado Git Credential Manager (`git config --global credential.helper manager`) — el PAT de GitHub queda guardado cifrado en el Administrador de Credenciales de Windows, ya no hace falta pegarlo en cada sesión. Si vence o se revoca, git lo vuelve a pedir en el próximo push.
- ✅ **Migración de contexto**: `CLAUDE.md` y `SKILL.md` migrados desde el Proyecto de claude.ai al repo (`.claude/skills/sucrebot-development/`), firmware (`trepador_sensor.ino`, `codigo_pista_seguidor_1.ino`) versionado en `Sucrebot/firmware/`, `Code.gs` reubicado fuera de cualquier repo (`C:\Users\raku\sucrebot-gas-local\`, con su propio `CLAUDE.md` aclaratorio de que no se commitea), skill del bot de WhatsApp copiado a su repo separado (`sucrebot-whatsapp/.claude/skills/bot-whatsapp/`).
- ✅ **INICIO/header compartido**: quitado el countdown regresivo (apuntaba al 16 jul 2026, quedaba congelado en `00:00:00:00` desde que pasó el evento) — vivía en `shared/components/header.html`, usado por las 21 páginas del sitio. CSS muerto asociado también limpiado de `mobile-fix.css`.
- ✅ **MANILLAS — bug real, página muerta desde el día del evento**: dos participantes tienen el robot nombrado literalmente `"7"` y `"8"` — Google Sheets autodetectó esas celdas como número, no texto. `renderLista()` llamaba `.localeCompare()`/`.toLowerCase()`/`.slice()` directo sobre `p.robot` sin convertir a string primero; con un `robot` numérico esos métodos no existen → `TypeError` → el `sort()` completo explota. Como el crash ocurre **después** de guardar el cache nuevo en localStorage pero **antes** de pintar stats/lista, se propaga al bloque de fallback (que usa un timestamp capturado *antes* del fetch, de ahí un indicador de caché mostrando millones de minutos — timestamp 0 desde época) y explota otra vez ahí, esta vez silenciada en un `catch(e2){}` vacío — dejando la página muerta en **cada** carga futura, no solo la del día del evento, porque el dato problemático seguía viniendo del Sheet. Fix: forzar `String(...)` antes de esos métodos en el sort, la búsqueda y el cálculo de iniciales del avatar. Mismo hueco encontrado y corregido en la búsqueda de `PARTICIPANTES_REGISTRADOS` (hubiera roto esa página también al escribir texto en el buscador).
- ✅ **`SKILL.md`**: corregido un frontmatter YAML duplicado/roto al inicio del archivo (una copia truncaba la `description` a mitad de frase) que hacía que el listado de skills disponibles se mostrara cortado.
- ✅ **`Code.gs` — historial local**: `C:\Users\raku\sucrebot-gas-local\` pasó a ser un repo git privado (sin remoto, nunca se sube a GitHub) para tener historial real de cada cambio — antes, pegar una versión vieja por error en script.google.com no dejaba rastro. Regla: todo cambio a `Code.gs` se commitea ahí antes de pegarlo.
- ✅ **`calcularRankingInstituciones()` — puntos inflados por certificados duplicados**: contaba cada fila de la hoja `certificados` como un podio distinto; si un certificado se regeneró varias veces (pasó durante las pruebas de diseño del 15 jul), cada regeneración sumaba otra medalla falsa (ej. una institución mostraba 10 oros cuando eran 2 reales). Fix: dedupe por `nombre+categoria+tipo` al sumar. `guardarCertificado()` también actualizado para reusar el código existente en vez de duplicar la fila si ya existe ese mismo certificado.
- ✅ **RESULTADOS — etiquetas de Soccer incompletas**: `SOC_FORMATO_LABEL` solo llegaba hasta `GRUPOS_9`; torneos de 10-14 equipos (el real en curso usa `GRUPOS_14`) mostraban el código crudo en vez de una descripción. Agregadas las etiquetas de 10 a 15.
- ✅ **Soccer — nuevo formato de 15 equipos**: `GRUPOS_15` (3 grupos de 5), reutilizando el mismo patrón de avance de fase que 9-13 (ronda de 3 ganadores → 2 mejores a FINAL, el tercero a bronce automático).
- ✅ **`publicarJSON()` — horas de tiempos truncadas a "00:"**: cuando Sheets autodetecta un tiempo tipo "1:14:32" como hora-del-día (típico cuando el cronómetro no se reinició entre participantes), Apps Script lo devuelve como objeto `Date` al leerlo — el código forzaba `'00:' + minutos + segundos` y descartaba `getHours()` por completo, disfrazando un tiempo corrupto de 1h04m43s como el aparentemente válido "00:04:43". Esto contaminó el ranking automático de Cubo Rubik (un tiempo corrupto pero "rápido" le ganaba a los tiempos reales). Fix aplicado también a la rama de número/fracción de día (antes producía "00:64:43", minutos sin acotar a 0-59). Verificado matemáticamente y en vivo: con el fix, Cubo Rubik calcula exactamente el mismo podio que ya estaba certificado.
- ✅ **Nueva acción `republicarJSON`**: antes había que entrar al editor de Apps Script y correr `publicarJSON()` manualmente para refrescar `resultados.json` después de un fix. Ahora es una sola llamada HTTP protegida con `STAFF_TOKEN_VALUE` (constante nueva en `Code.gs`, mismo valor que el frontend — protección liviana, no criptográfica).
- ⚠️ **Hallazgo de seguridad sin resolver**: el backend de `Code.gs` **no valida el staff token en ninguna acción existente** (ni la constante existía antes de hoy) — incluye acciones destructivas como `eliminarParticipante`. Cualquiera con la URL de GAS (pública, está en `config.js`) puede llamarlas sin token. Queda pendiente como tarea aparte, no se tocó para no mezclar alcance.
- ✅ **RESULTADOS — Seguidor Pro con resultado real invertido**: Rb26 tenía dos filas cargadas como el mismo partido de ronda final (mismo `ronda`/`intento`) con tiempos distintos (00:04:05 y 00:10:47); el sistema tomaba automáticamente el más rápido, que resultó ser el falso. Corregido borrando la fila incorrecta y reconstruyendo la real con `eliminarResultado`/`pushResultado`. Confirma que **Shippu** es el ganador real de Seguidor Pro, no RAMBOT (cuyo certificado de GANADOR también parece estar mal — no tiene ninguna corrida de ronda final registrada, ver más abajo).
- ✅ **`parsearBracketGeneral()` — fases ocultas más allá de RONDA 2**: la lista de nombres de fase para armar la respuesta era fija (`['RONDA 1','RONDA 2',...]`); cualquier `RONDA 3+` generada en la hoja quedaba invisible para el frontend aunque existiera y estuviera bien. Afecta cualquier bracket con suficientes equipos para necesitar más de 2 rondas (ej. Minisumo RC con 19 equipos reales). Fix: detectar dinámicamente todas las fases "RONDA N" presentes y ordenarlas numéricamente.
- ✅ **Nueva acción `eliminarPartidoGeneral`**: necesaria para limpiar una Ronda 3 duplicada de Minisumo RC que quedó generada dos veces (la automática oculta por el bug anterior, y otra creada al reintentar manualmente el avance de fase antes de saber que el bug era de visualización). Ninguna tenía resultados cargados, se pudo limpiar sin perder nada real.
- ✅ **Bracket general — se elimina el formato "todos contra todos"**: confirmado con Raku que el flujo esperado de Minisumo (RC, Autónomo, y Batalla por compartir el mismo motor) es eliminación directa 1vs1 siempre, sin importar cuántos equipos arranquen — sorteo, BYE si es impar, se repite con los sobrevivientes ronda tras ronda hasta llegar a 2 y jugar la FINAL. Antes, el código desviaba a una tabla de puntos "todos contra todos" cada vez que quedaban exactamente 3 sobrevivientes (sea porque la categoría arrancó con 3/5/6 equipos, o porque un bracket grande se redujo a 3 en el camino) — eso ya no pasa para torneos nuevos. **Minisumo Autónomo ya jugó su "todos contra todos" real con resultados cargados antes de este fix** (Axebot/Kitsune/Kachetes 2.0) — ese bracket específico no se reinterpreta ni se deshace, el código de lectura/cálculo de podio para TCV se mantiene intacto solo para no romper esos resultados históricos.
- ✅ **Certificados — se veían mal aleatoriamente por carrera con fuentes**: la fuente `EB Garamond` se cargaba con `@import` dentro del HTML inyectado al abrir la vista previa, no precargada en el `<head>`. El cálculo de escala corría casi al instante, casi siempre antes de que la fuente terminara de descargar — medía con la fuente de reemplazo, calculaba mal la escala, y el texto real no coincidía después (por eso era aleatorio: con la fuente en caché salía bien, sin caché salía mal). Fix: `EB Garamond` agregada al `<link>` de Google Fonts del `<head>` en `GENERAR-CERTIFICADOS` y `CERTIFICADOS`, y el cálculo de escala ahora espera `document.fonts.ready` antes de medir (con recálculo de respaldo a los 500ms). Efecto secundario encontrado y corregido: al correr el cálculo más de una vez, la altura fijada en la primera corrida se retroalimentaba en las siguientes — ahora resetea la altura del contenedor antes de cada medición.
- ✅ **Auspiciante daly bella**: link cambiado de Instagram a TikTok (`shared/js/auspiciantes.js`).

**Principios nuevos**:
- Cualquier campo que venga de una hoja de Google Sheets y se use con métodos de string (`.localeCompare`, `.toLowerCase`, `.slice`, `.startsWith`, etc.) debe envolverse en `String(...)` antes — Sheets puede autodetectar y guardar como número cualquier celda cuyo contenido "parezca" numérico, incluso en campos de texto libre como el nombre de un robot. Ya se conocía este riesgo para *escrituras* (`setNumberFormat('@')` antes de `setValue()`, documentado desde el bug del marcador de Soccer); ahora también aplica para *lecturas* en el frontend.
- Datos "aparentemente válidos" (un tiempo rápido, un resultado con marcador numérico) pueden ser silenciosamente falsos si vienen de una fila duplicada o de un dato corrupto — cuando un resultado no coincide con lo que el staff recuerda del evento real, cruzar contra la hoja `certificados` (o pedir confirmación directa) antes de asumir que el cálculo automático tiene razón.
- Fuentes web cargadas dinámicamente (vía `@import` dentro de HTML inyectado) crean condiciones de carrera con cualquier cálculo de layout que dependa de medir texto — precargarlas en el `<head>` de la página, y de todas formas esperar `document.fonts.ready` antes de medir.
- Toda funcionalidad de bracket/torneo debe confirmarse contra lo que el staff espera del reglamento real antes de asumir que el algoritmo ya documentado es el correcto — el "todos contra todos" llevaba tiempo en el código sin que nadie confirmara si era el comportamiento deseado.

---

**Event date: July 16, 2026 · sucrebotclub-institute.github.io/Sucrebot/**
**SKILL.md actualizado por última vez: 19 julio 2026**