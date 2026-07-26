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
- Alinear "Miembro 2" → "Subcapitán" en MI-REGISTRO y PARTICIPANTES_REGISTRADOS.
- Popular `driveId` de Minisumo RC en REGLAMENTOS.
- **Producción migró a un Sheet/proyecto de Apps Script nuevo** (sprint 23-24 jul) — el viejo (151 versiones) queda como archivo histórico. Ver memoria `project-migracion-sheet-nuevo-23jul` para el Deployment ID vigente y qué datos no se copiaron.
- [x] Extender el patrón de RESULTADOS a PANEL-CALIFICACION (bai/dev/lk) — hecho sprint 25-jul, ver SKILL.md. Sigue pendiente extenderlo a CRONOMETRO/INSECTOS (tiempos).
- Auditar `cache:'no-store'` en el resto de páginas con `fetch(GAS...)` propio (INSECTOS, ESCANER, etc.) — se encontró y corrigió el mismo bug en CRONOMETRO/PANEL-CALIFICACION/MANILLAS/PANEL-BRACKET esta sesión, no se revisaron todas.
- **CRONOMETRO — ranking indexado por nombre de robot, no por ID** (encontrado sprint 25-jul, ver SKILL.md): riesgo real si dos robots de la misma categoría comparten nombre. Pendiente de corregir, es la próxima tarea acordada con Raku.
