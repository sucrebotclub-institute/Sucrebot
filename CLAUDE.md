# SucreBot — Contexto del proyecto para Claude Code

Plataforma de gestión de competencia de robótica para el Instituto Superior Universitario Sucre / Club de Robótica Sucre. Evento principal: SucreBot 2026 (IV Edición), 16 de julio de 2026, Ex UNASUR/CMI, Sucre, Ecuador. **El evento ya concluyó** — el trabajo actual es mantenimiento, deuda técnica pendiente y mejoras de cara a futuros eventos.

Zona horaria del proyecto: **Ecuador**, nunca asumir Bolivia.
Todas las sesiones de trabajo se conducen en **español**.

---

## Arquitectura

- **Frontend**: GitHub Pages — repo `sucrebotclub-institute/Sucrebot`, rama `main`. La home vive en `INICIO/index.html`, NO en la raíz del repo.
- **Backend**: Google Apps Script (`Code.gs`). **NUNCA se commitea a GitHub** — contiene el secreto `GITHUB_TOKEN`. Se edita exclusivamente pegando el código en script.google.com. Después de cada deploy, actualizar el Deployment ID en `shared/js/config.js` y commitear ese archivo.
- **Base de datos**: Google Sheets.
- **Hardware**: Arduino Uno + sensores IR Sharp GP2Y0A21YK0F (CRONOMETRO/INSECTOS), ESP32 (Trepador), todo vía Web Serial API en el navegador.
- **Bot de WhatsApp**: Baileys/Node.js, corre con Windows Task Scheduler, repo separado `sucrebotclub-institute/sucrebot-whatsapp-bot`.
- **PDFs de certificados**: Playwright headless.

### Arquitectura frontend
- Páginas modulares con componentes compartidos vía atributos `data-include`.
- Auth: token de staff compartido en `localStorage`.
- CSS compartido: `../shared/css/styles.css` + `../shared/css/mobile-fix.css`.
- JS compartido:
  - `shared/js/config.js` — centraliza `CONFIG.GAS_URL()`. **Debe cargar en `<head>`**.
  - `shared/js/auth.js` — manejo de sesión de staff token (`activarSesion`, `cerrarSesion`, `cambiarCuenta`). Claves reservadas de localStorage: `sucrebot_user`, `sucrebot_staff_token` — **nunca limpiarlas en scripts genéricos de limpieza de caché**.
  - `shared/js/load-components.js` — cargador de componentes, dispara evento `componentsLoaded`.
  - `shared/js/certificados.js` — HTML de certificados, generación de PDF, subida a Drive.
  - `shared/js/auspiciantes.js` — carruseles/splash de auspiciantes.
  - `shared/js/clubes.js` — grid "Clubes participantes" de INICIO (gestionable desde CONFIGURACION → Clubes).
  - `shared/js/offline-excel.js` — modo offline con Excel local (CRONOMETRO/INSECTOS/PANEL-CALIFICACION).
  - `sw.js` — Service Worker red-primero, para que las páginas carguen sin internet.

### Staff token
```js
const STAFF_TOKEN = 'SucreBot2026-CMI-Sucre-x7k9mQ';
```
Todas las llamadas `gasPost` deben incluir `staffToken`, **excepto** las ACCIONES_PUBLICAS: `setParticipante`, `uploadComprobante`, `uploadLogo`.

### Deprecado / legacy (no reintroducir)
- EmailJS — eliminado mayo 2026.
- ImgBB — eliminado mayo 2026. Todo upload va a Google Drive vía GAS.
- ESCANER-SOCCER / CRONOMETRO-SOCCER — eliminados junio 2026. Soccer usa PANEL-BRACKET.
- `getEquiposSoccer` / `equipos_soccer` / `bracket_soccer` — legacy. Soccer migró a hoja `soccer_torneo`.
- Google OAuth / `STAFF_EMAILS` en config.js — reemplazado por staff token compartido.
- Batalla en PANEL-CALIFICACION — eliminado 21 jun 2026. Migró a PANEL-BRACKET.
- Soccer en `bracket_general` — eliminado 22 jun 2026. Tiene hoja propia `soccer_torneo`.
- `publicarJSON()` / `RESULTADOS/resultados.json` / `GITHUB_TOKEN` — eliminados 23-24 jul 2026. RESULTADOS ya no lee un JSON publicado a GitHub, consulta GAS directo (`getPodioPublicado`/`getPodioManual`). El token también desapareció del código (resuelve el pendiente de rotarlo, por eliminación).
- `RESULTADOS_ABIERTO_AL_PUBLICO` — eliminado 23-24 jul 2026. RESULTADOS pasó a ser staff-only permanente, sin toggle público.

---

## CATEGORIA_MAP (constante en GAS)

Nota: en realidad tiene **26 entradas** — las 13 originales de abajo + 13 "copia" (mismo nombre + `" [Copia]"`, códigos con sufijo `2`: `ins2`, `trp_a2`, `sl_a2`, `sl_p2`, `ms_a2`, `ms_rc2`, `bai2`, `bat2`, `dev2`, `trp_p2`, `soc2`, `cr2`, `lk2` — ver `CODIGOS_CATEGORIA_COPIA`). Se omiten acá por brevedad.

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
  // + 13 categorías "copia" -- ver nota arriba
};
```

---

## Google Sheets — pestañas

| Tab | Cols | Notas |
|---|---|---|
| `participantes` | 17 | id, nombre, institucion, ciudad, robot, contacto, correo, categoria, archivoUrl, aprobado, razonRechazo, miembro2, manilla, comprobante, logoUrl, equipo, fecha_registro |
| `instituciones` | 1 | Lista permanente. Dedupe case-sensitive |
| `activo` | 3 | ruta, raw_json, timestamp |
| `resultados` | 9 | participanteId, nombre, robot, institucion, tiempo, ronda, intento, ruta, fecha |
| `estados` | 3 | ruta, json, timestamp |
| `categorias_activas` | 5 | ruta/categoria, usuario, timestamp, estado, ronda |
| `certificados` | 10 | correo, nombre_completo, categoria, institucion, evento, fecha_evento, tipo_certificado, fecha_generacion, codigo_verificacion, archivoUrl |
| `criterios_calificacion` | 7 | categoria (bai/dev/lk), nombre, descripcion, orden, activo, timestamp, peso |
| `puntuaciones` | 11 | id_participante, nombre, robot, institucion, categoria, juez_email, juez_nombre, criterios_json, notas_json, total, timestamp |
| `bracket_general` | 13 | torneo_id, categoria, fase, partido_id, equipo_a_id/nombre, equipo_b_id/nombre, ganador_id, marcador, estado, siguiente_partido_id, timestamp — solo ms_a, ms_rc, bat (NO soccer) |
| `soccer_torneo` | — | hoja propia para Robot Soccer (formatos GRUPOS_8 a GRUPOS_14) |
| `podio_manual` | 6 | categoria, posicion, equipo_id, equipo_nombre, timestamp, total — equipo_id de Soccer es sintético (`'eq-'+nombre del equipo`), NO el id real del participante |
| `podio_publicado` | 2 | categoria, timestamp — gate de RESULTADOS, se marca/desmarca solo desde `guardarPodioManual`/`despublicarPodio` |

---

## Reglas críticas (no romper esto)

### Flujo de la API de GitHub
- (Nota: el "bot de resultados" que commiteaba cada 15-20s vía `publicarJSON()` se eliminó por completo en el sprint 23-24 jul — ya no hay commits automáticos de Code.gs a GitHub. Los puntos de abajo siguen valiendo para cualquier push manual/vía Claude Code.)
- **Siempre** pedir el SHA fresco inmediatamente antes de cada PUT — nunca reusar un SHA cacheado, evita conflictos 409.
- Verificar deploys con la **Contents API** (`GET /contents/PATH?ref=main` con header de Authorization), **no** con `raw.githubusercontent.com` (tiene cache de CDN que puede estar desactualizado 10–15 min tras el build).
- Después de un commit: `POST /pages/builds` → hacer polling a `/pages/builds/latest` chequeando **ambas** condiciones: `status === "built"` Y `commit === target_sha`.
- `status: "errored"` con `duration: 0` es un hipo transitorio del pipeline de GitHub — reintentar.
- El Service Worker cachea agresivamente. Ctrl+Shift+R evita la CDN pero no el Cache Storage del SW — usar incógnito o DevTools → Application → Service Workers → Unregister para limpiar de verdad.
- El CDN de GitHub Pages (Fastly) puede tardar varios minutos en propagar incluso después de que el build de Actions ya muestre ✅ — no es lo mismo "build exitoso" que "ya se ve en producción", verificar ambos por separado con un `fetch(..., {cache:'no-store'})` directo a `sucrebotclub-institute.github.io`.

### Encoding y validación (siempre antes de cada push)
- Codificar en base64 con Python, verificar `content.count('Ã') == 0` (detecta doble-encoding UTF-8).
- Validar JS con `node --check` sobre bloques `<script>` extraídos (usar `re.findall(r'<script>(.*?)</script>', content, re.DOTALL)` para scripts inline en HTML).
- Nunca parchear `REGISTRO/index.html` descargándolo del repo si tiene historial de problemas de encoding — usar contenido fuente limpio directamente.

### Reglas de arquitectura
- `Code.gs` **NUNCA** se commitea a GitHub — pegar manualmente en script.google.com.
- Cualquier cambio de auspiciante requiere actualizar **DOS** archivos: `shared/js/auspiciantes.js` (carruseles/splash) Y `shared/js/certificados.js` (listas `CERT_SPONSORS_TOP/LEFT/RIGHT` para el layout de certificados) — es fácil olvidar el segundo.
- GAS usa `Content-Type: text/plain;charset=utf-8` para CORS (nunca `application/json`).
- `config.js` debe cargar en `<head>`.
- Errores de sintaxis en GAS son **silenciosos** — un `Logger.log` suelto fuera de cualquier función causa fallos de deploy silenciosos. Validar estructura antes de desplegar.

### Hardware
- Sharp GP2Y0A21YK0F requiere VCC de 5V — 10V en pines ADC quema los sensores.
- Falsos triggers con múltiples sensores en un mismo riel de 5V = picos de corriente (problema conocido del datasheet Sharp) → agregar capacitores de desacople.
- Artefacto de Arduino Uno al cambiar de canal ADC: requiere doble lectura (descartar el primer `analogRead`, usar el segundo).
- Firmware final de INSECTOS: `UMBRAL 300`, `DEBOUNCE_MS 500`, doble lectura por canal, sin R-gate, solo salidas `C1`–`C4`.
- ESP32: GPIO 19/21 no tienen capacidad ADC; usar 32, 33, 34, 35, 36, 39.
- Nunca enviar `'F'` al ESP32 al conectar — causa `NetworkError: device lost`.
- Referencia de puerto Web Serial obsoleta cuando el dispositivo se desconecta físicamente a mitad de sesión → Chrome mantiene el estado de "ya abierto"; recargar la página para recuperar.

### Arduino/Serial
- Usar `Serial.print("START\n")`, no `println` (evita problemas de parseo por `\r\n`).
- El baud rate debe coincidir entre firmware y JS (`baudRate` en las opciones de Web Serial).
- `decoder.decode(value, { stream: true })` es obligatorio para Web Serial; sin `{ stream: true }`, la fragmentación a nivel de bytes rompe el parseo.
- Los finales de línea `\r\n` de Arduino necesitan `.replace(/\r/g, '')` en el navegador.

### Generación de PDF de certificados
- Playwright con `sync_playwright`, `page.wait_for_load_state('networkidle')` + `page.wait_for_timeout(400)` antes de `page.pdf()` para renderizar de forma confiable fuentes externas e imágenes de auspiciantes.
- `pdftoppm -png -r 150` para inspección visual de páginas.
- `html2canvas` 1.4.1 falla con `InvalidStateError` cuando se aplica `object-fit: contain` a un `<img>` — quitar `object-fit` de esas reglas CSS.

### Bugs recurrentes ya documentados (no reintroducir)
- `bloquearCategoria` está ausente del frontend de PANEL-BRACKET (Soccer es seguro en multi-dispositivo en paralelo durante fase de grupos; requiere recarga manual antes de la fase eliminatoria).
- (Deprecado, ya no aplica desde sprint 23-24 jul: `publicarJSON`/`resultados.json` se eliminaron por completo.) `guardarPodioManual` con `posiciones: []` vacío desmarca `podio_publicado` (categoría deja de verse en RESULTADOS) — resetear un bracket ya NO hace esto, es una acción aparte (`despublicarPodio`, botón "Quitar de Resultados" en RESULTADOS).
- Marcadores de soccer: `setValue()` de GAS autodetecta `"3-4"` como fecha → arreglar con `setNumberFormat('@').setValue(String(marcador))` antes de guardar.
- El flag `esperandoConfirmacionIntento` bloquea tanto clicks manuales como triggers automáticos de sensor para evitar avances de intento no intencionados.
- `reiniciarCrono()` debe enviar `'R'` a CATS_PULSADOR (Cubo Rubik) después de resetear, o los pulsadores quedan permanentemente sin respuesta; **no** debe enviar `'R'` en `iniciarCrono()` (causa doble START).
- Propagación de BYE en `propagarByesGeneral()`: usar un objeto de tracking `ocupado` en tiempo real, no un snapshot desactualizado.

---

## Patrones de código útiles

- `str.replace(old, new, 1)` con un `assert old in content` antes de cada reemplazo — hace evidente cualquier mismatch de inmediato.
- `repr(content[idx:idx+400])` para inspeccionar bytes exactos cuando falla un match de string literal.
- `json.load(sys.stdin)['sha']` inline por pipe para obtener el SHA.
- Heredocs de bash: usar `<< 'PYEOF'` (delimitador con comillas simples) para evitar que `${}` se interprete dentro de bloques de Python.
- `node --check` solo sobre archivos `.js` (no `.html` directamente).
- Archivos con finales de línea Windows (`\r\n`): abrir con `newline=''` para preservar el contenido byte a byte.

---

## Windows Task Scheduler (bot de WhatsApp)

- Formato de fecha: `DD/MM/YYYY` (locale Ecuador), NO `MM/DD/YYYY`.
- El modo "Solo interactivo" requiere sesión desbloqueada — usar el usuario `SYSTEM` en su lugar.
- El fix de restricción de batería requiere PowerShell (`Get-ScheduledTask`/`Set-ScheduledTask`, `DisallowStartIfOnBatteries = $false`) — no hay equivalente en `schtasks`.
- `schtasks /change` con `/RU "SYSTEM"` requiere una shell elevada.
- Los triggers "Solo una vez" que ya se dispararon necesitan un ciclo `/disable` + `/enable` para rearmarse — `/st` solo no alcanza.
- "Último tiempo de ejecución: 30/11/1999" con código `267011` = estado normal de "nunca ejecutado", no un error.

---

## Cómo prefiere trabajar Raku (el dueño del proyecto)

- Revisa los cambios en vivo en su teléfono/computadora y confirma con "listo" o "sí" antes de pasar a la siguiente tarea.
- Prefiere recibir **archivos completos de reemplazo** listos para copiar y pegar, no diffs parciales — aunque con Claude Code editando el repo real, el diff en sí es el equivalente natural (Claude Code te muestra el cambio antes de aplicarlo).
- Confirma el alcance/intención antes de ver código; corrige decisiones estructurales a mitad de la implementación sin fricción.
- Espera que se valide sintaxis y encoding antes de cada push, y que se confirme el deploy antes de cerrar la sesión.
- Prefiere ritmo secuencial, una tarea a la vez.
- Autenticación de git resuelta con Git Credential Manager (`git config --global credential.helper manager`), que guarda el PAT cifrado en el Administrador de Credenciales de Windows — ya no hace falta proveerlo en cada sesión. Si el token vence o se revoca, git lo va a pedir de nuevo en el próximo push.

---

## Sprint 15 jul 2026 (recta final pre-evento) y día del evento (16 jul)

- **CRONOMETRO**: layout sticky corregido; corregida race condition donde el polling de 2s reprocesaba a un participante inmediatamente después de que el sensor se detenía (bloqueado con el flag `esperandoConfirmacionIntento`); ronda final de INSECTOS pasada a mejor-de-2.
- **INSECTOS**: layout sticky de 3 columnas; distinción "—" vs DNF en los rankings; bloqueado el registro de tiempo/DNF antes de la cuenta regresiva; "Reiniciar tiempo" limpia los tiempos de todo el grupo; conexión Web Serial unificada entre clasificación→final sin tener que reconectar; corregidas calificaciones falsas en 00:00:00 antes del start; fixes de hardware (capacitor defectuoso causando falsos triggers, sensores quemados por sobrevoltaje de 10V en A2, falsos triggers de pull-up I2C en A5).
- **REGISTRO**: se abrió y cerró varias veces el día del evento vía la variable de timestamp `CIERRE_REGISTRO`.
- **Certificados**: 26 PDFs generados (13 categorías × 1er y 2do lugar) con renderizado headless de Playwright; tamaños de logo ajustados (club 108px, Sucre 122px); texto de logro dividido en 3 líneas; logo del club cambiado a la versión con fondo transparente (`club-robotica-transparente.png`).
- **Bracket de Soccer**: documento Word actualizado (intercambio de grupos Dio Sabra ↔ ATOM X).
- **Bracket en papel de Minisumo RC**: generado para 21 participantes, eliminación simple ("Black Noir"/"Blanck Noir" tratado como el mismo participante con typo → 21 participantes en total).

---

## Estado actual (post-evento, julio 2026)

El evento SucreBot 2026 se realizó el 16 de julio de 2026 y ya concluyó. El trabajo actual es de mantenimiento y mejoras pendientes, no de sprint pre-evento. Pendientes conocidos:

- [x] `GITHUB_TOKEN` — resuelto por eliminación (sprint 23-24 jul): se quitó el pipeline `publicarJSON()`/GitHub completo de `Code.gs`, el token ya no existe en el código, no hace falta rotarlo.
- [x] RESULTADOS ya no tiene un toggle de "abrir al público" — pasó a ser staff-only permanente (sprint 23-24 jul), ver SKILL.md.
- Verificar salud de sesión del bot de WhatsApp antes de futuros eventos; establecer plan de respaldo manual con un miembro del comité.
- Soporte multi-mesa en CRONOMETRO — evaluar solo si el volumen de inscritos en una categoría lo justifica en un futuro evento.
- [x] Alinear "Miembro 2" → "Subcapitán" en MI-REGISTRO y PARTICIPANTES_REGISTRADOS — confirmado hecho (14-ago).
- [x] Popular `driveId` de Minisumo RC en REGLAMENTOS — confirmado hecho.
- **Producción migró a un Sheet/proyecto de Apps Script nuevo** (sprint 23-24 jul) — el viejo (151 versiones) queda como archivo histórico. Ver memoria `project-migracion-sheet-nuevo-23jul` para el Deployment ID vigente y qué datos no se copiaron.
- [x] Extender el patrón de RESULTADOS a PANEL-CALIFICACION (bai/dev/lk) — hecho sprint 25-jul. Extendido también a CRONOMETRO/INSECTOS (tiempos) el 26-jul (commit `52ab430`) — las 13 categorías publican podio en RESULTADOS.
- [x] Auditar `cache:'no-store'` en el resto de páginas con `fetch(GAS...)` propio — confirmado hecho.
- [x] Limpieza manual de entradas `[DEV]` sueltas (`config_colores_categoria`, `soccer_avance_manual` de pruebas) — confirmado hecho.
- [x] **CRONOMETRO — ranking indexado por nombre de robot, no por ID** (encontrado sprint 25-jul): corregido el 26-jul (commit `8fdf1eb`), ahora indexa por `id` real del participante.
- [x] **`calcularRankingInstituciones()` contaba doble los podios de equipo** (2 integrantes = 2 filas de certificado = puntos duplicados frente a una categoría individual) — corregido 27-jul, dedupe pasó de `nombre+categoria+tipo` a `categoria+tipo` (cada categoría reparte un solo oro/plata/bronce). Ver [[project-ranking-instituciones-fix-27jul]].
- **Robot Soccer cambió de arquitectura** (sprint 26-27 jul): ya no usa los formatos automáticos `GRUPOS_8`/`GRUPOS_9-14` documentados en `SKILL.md` — ahora es sorteo manual ronda por ronda (`generarRondaSoccer`, `equipos_pool`/`llaves` armados a mano desde PANEL-BRACKET). `SKILL.md` sección "ROBOT SOCCER — Formatos 13 y 14 equipos" quedó desactualizada, no se reescribió todavía.
- **PANEL-BRACKET: cerrar un combate (Minisumo/Batalla) terminado sin guardar perdía el resultado sin ningún aviso** — corregido 27-jul (commit `35f9887`), ahora avisa explícitamente. Ver [[project-panel-bracket-cierre-sin-guardar-27jul]].
- [x] Limpieza manual en el Sheet (data `[DEV]` de la prueba end-to-end del 27-jul): certificados `[DEV]` de las 13 categorías + 2 de una prueba aislada del fix de doble conteo (`CERT-2026-442`/`443`, institución "[DEV] Instituto Doble Conteo Test"), filas `[DEV]` en `resultados_publicados`, y la hoja `resultados` — confirmado hecho (14-ago). Ver [[project-prueba-e2e-ranking-27jul]].
- **Chequeo general 31-jul** (Raku revisó toda la página en producción), pendientes nuevos sin empezar:
  - [x] Roles: la cuenta del club y la de la carrera de Electrónica deben quedar como **solo Admin** — hecho (protección `CORREOS_PROTEGIDOS` en backend + frontend, sprint 31jul-1ago), confirmado hecho (14-ago).
  - [x] Generar/organizar carpetas por **edición del evento** — hecho 2-ago (Drive) + 6-ago (sistema completo, ver abajo).
  - [x] Agregar un **selector de edición** — hecho 6-ago, pero terminó siendo distinto a lo imaginado originalmente (no un dropdown público, ver "Sistema de ediciones" abajo).
  - [x] Soccer (PANEL-BRACKET): mostrar el **puntaje obtenido** por partido y quiénes **pasan a la siguiente ronda** — confirmado hecho (14-ago).
  - [x] Minisumo (PANEL-BRACKET): permitir **editar manualmente el puntaje** de cada combate — hecho (modal de edición con inputs numéricos, sprint 31jul-1ago), confirmado hecho (14-ago).
  - [x] INSECTOS: advertencia si el **tiempo manual** ingresado supera los **2 minutos reglamentarios** — hecho 1-ago.
- **Sistema de ediciones completo (6-ago)** — reemplaza el enfoque de "Sheet + deployment nuevos por edición" por un único deployment que cambia de Sheet activo vía Script Properties. Desde CONFIGURACION → Ediciones: generar edición nueva, activar una anterior sin perder su configuración, quitar una del registro. Ver SKILL.md sprint 06-ago-2026 para el detalle completo (arquitectura, bugs encontrados, principios). Producción activa: **Edición V**. Pendiente manual: borrar de Drive los Sheets de las ediciones de prueba descartadas (VI/TESTFIX/TESTFIX2, links en el historial del chat).
- **PANEL-BRACKET Soccer — botón "🔁 Revancha"** (6-ago): reabre un partido `FINALIZADO` a `PENDIENTE` sin re-sortear la llave.
- **Nueva categoría "Drones"** (`dro`, sprint 07-ago) — cronómetro manual + puntos en vivo (+1/-1) dentro de CRONOMETRO, ranking por puntos con tiempo de desempate, DNF siempre debajo. Deploy `Code.gs` confirmado (Deployment ID `AKfycby4boRvj_wMVGVw8vE3x4L__O9bbTsTaqbuUu2tTR3J0emNB_d8XhqSM-XYB28xRcSL9g`). Ver SKILL.md sprint 07-ago-2026 para el detalle completo (arquitectura, mapas locales que hubo que tocar en 7 páginas distintas, colores de categoría centralizados). [x] Color oficial de manilla + contenido de REGLAMENTO para Drones — confirmado hecho (14-ago).
- **Colores de categoría centralizados** (sprint 07-ago) — nueva pestaña CONFIGURACION → Colores, reemplaza las 3 tablas hardcodeadas que tenían MANILLAS/PARTICIPANTES_REGISTRADOS/PANTALLA (estaban desincronizadas entre sí). Las categorías "copia" con nombre asignado también tienen color propio ahí. Ver SKILL.md sprint 07-ago-2026.
- **CONFIGURACION → 🧹 Limpiar Sheet** (sprint 08-ago) — botón Admin-only para vaciar participantes/resultados/brackets/podios/estados de la edición activa después de pruebas, con doble confirmación (escribir el código de la edición). No toca certificados/instituciones/personal/criterios. Ver SKILL.md sprint 08-ago-2026.
- **Auspiciantes gestionables desde CONFIGURACION** (sprint 08-ago) — dejaron de ser un array hardcodeado en `shared/js/auspiciantes.js`; ahora se agregan/editan/ocultan/eliminan desde CONFIGURACION → Auspiciantes, con subida de logo a Drive. Un solo checkbox "Ocultar auspiciante" controla INICIO/INSTITUCION/RESULTADOS y certificados a la vez. Bug real corregido: `drive.google.com/uc?export=view` lo bloquea Google como `<img>` cross-origin (funciona solo navegando directo) — se usa `lh3.googleusercontent.com/d/FILEID` en su lugar. [x] Mismo bug en `uploadLogo` (logos de equipo) — confirmado corregido (14-ago). Ver SKILL.md sprint 08-ago-2026 para el detalle completo.
- **Clubes participantes gestionables desde CONFIGURACION → Clubes** (sprint 08/09-ago) — mismo patrón que Auspiciantes: el grid hardcodeado de INICIO (26 `<img>` fijas) pasó a `shared/js/clubes.js` + hoja `clubes` en Sheets (auto-sembrada con los logos existentes, sin nombre — se completan a mano después). Solo nombre + logo + oculto (sin link/carta, a diferencia de auspiciantes). Solo en INICIO, no en INSTITUCION.
- **Página INSTITUCION completamente editable en vivo, sin pasar por CONFIGURACION** (sprint 09-ago) — Quiénes somos (+ imágenes), Misión/Visión, Nuestros valores (lista libre), Galería de fotos (agrupada por título de edición, ej. "4ta Edición") y la portada/hero (título/subtítulo/foto de fondo). Mismo patrón que REGLAMENTO: `body.staff-mode` (cualquier staff logueado, no solo Admin) revela botones "🔧 Editar"/lápices que abren un modal con un solo "Guardar cambios" — CONFIGURACION quedó intacta (sigue 100% Admin-only, sin pestaña de Institución). Ver SKILL.md sprint 09-ago-2026 para el detalle completo (arquitectura, iteración de diseño, bugs corregidos).
- **PARTICIPANTES_REGISTRADOS editable en vivo** (16-ago) — modal "Revisar participante" ahora permite editar nombre/institución/ciudad/correo/contacto/robot/categoría/subcapitán desde staff, sin resetear el estado de aprobación. Nueva acción `actualizarParticipanteStaff` en `Code.gs` (staffToken, sin exigir correo — a diferencia de `actualizarParticipante`, la pública que usa MI-REGISTRO). De paso se corrigió un bug real: la fusión de institución (botón "Editar/Fusionar") venía fallando en silencio desde la auditoría del 14-ago porque llamaba a `actualizarParticipante` sin mandar `correo`. Ver SKILL.md sprint 16-ago-2026 para el detalle completo.
- **REGISTRO editable en vivo** (16-ago) — precios (3 períodos con fechas activo/vencido), textos de portada/aviso, y título+caption+QR de la tarjeta de WhatsApp, editables desde botones "🔧 Editar" (staff). Hallazgo real: los cuadros de precios ya no existían en el HTML (solo CSS/JS muerto apuntando a elementos borrados) — se reconstruyeron editables desde cero. Nuevas acciones en `Code.gs`: `getPreciosRegistro`/`getRegistroContenido` (públicas), `guardarPreciosRegistro`/`guardarRegistroContenido`/`uploadImagenRegistro` (staffToken). Ver SKILL.md sprint 16-ago-2026 (2) para el detalle completo.
- **Pendiente: Raku debe pegar el `Code.gs` actualizado en script.google.com** (`sucrebot-gas-local/Code.gs` ya tiene los 2 cambios de arriba juntos, validado con `node --check`) y pasar el nuevo Deployment ID.
- [x] **Auditoría de seguridad de `Code.gs` — 7 vulnerabilidades reales corregidas** (14-ago) — 4 fugas de PII sin login (`getParticipantes` exponía contacto/correo/comprobante de todos; `getPuntuaciones` exponía `juez_email`; `obtenerTodosCertificados` exponía `correo`) + 3 fallas de integridad más graves (`setParticipante` y `actualizarParticipante` permitían sobrescribir la inscripción de CUALQUIER participante adivinando su id secuencial, sin login ni verificar identidad; `enviarQR` permitía mandar mails con remitente "SucreBot" a cualquier dirección; `renombrarLogo` permitía renombrar cualquier archivo de Drive por fileId). Deploy confirmado y verificado en vivo (Deployment ID `AKfycbwuvixEeB2As5vzz0XL6YZiMzNx4YwkQJnGQ9oNXK9mS5Rslq-27gvxo8PjTVM1bx-j4A`). Commits `d44ae980`/`1006aa7f`/`78448234`. Ver SKILL.md sprint 14-ago-2026 para el detalle completo (metodología de verificación, principios). Efecto colateral no relacionado: el repo pasó a privado y a público de nuevo el mismo día — **repo privado apaga GitHub Pages en el plan gratuito**, y volver a público no lo reactiva solo (hay que reseleccionar la rama en Settings → Pages a mano). [x] Auditoría del resto de acciones GET (`getRolPersonal`/`getBracketGeneral`/`getSoccerTorneo`/`getPodioManual`/`getRankingInstituciones`/`getTablaPosiciones`/`getPodioSoccer`/`getRankingCalificacion`) — confirmado hecho (14-ago).
