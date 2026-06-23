// ════════════════════════════════════════════════════════════════════════
// CERTIFICADOS.JS - Sistema de generación y subida de certificados a Drive
// Ubicación: /shared/js/certificados.js
// Versión: Junio 2026 — rediseño premium (marco dorado, Playfair, roseta SVG)
// ════════════════════════════════════════════════════════════════════════

const LOGO_SUCRE = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/logosucre.png';
const LOGO_CLUB  = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/club-robotica-fondo-blanco.png';

const CERTIFICADO_TEMPLATE = `
<div class="cert-wrap" id="certificado-preview">

  <!-- Fondo geométrico -->
  <div class="cert-geo">
    <div class="cert-geo-tri gt1"></div>
    <div class="cert-geo-tri gt2"></div>
    <div class="cert-geo-tri gt3"></div>
    <div class="cert-geo-tri gt4"></div>
    <div class="cert-geo-tri gt5"></div>
  </div>

  <!-- Marco dorado + esquinas -->
  <div class="cert-frame"></div>
  <div class="cert-corner cc-tl"></div>
  <div class="cert-corner cc-tr"></div>
  <div class="cert-corner cc-bl"></div>
  <div class="cert-corner cc-br"></div>

  <!-- Columna principal -->
  <div class="cert-main">

    <!-- Fecha y código -->
    <div class="cert-top">
      <p class="cert-fecha">Quito D.M., {{FECHA_EVENTO}}</p>
      <p class="cert-codigo">{{CODIGO_VERIFICACION}}</p>
    </div>

    <!-- Logo Instituto Sucre -->
    <div class="cert-logo-top">
      <img src="${LOGO_SUCRE}" alt="Instituto Superior Universitario Sucre" class="cert-logo-sucre"/>
    </div>

    <!-- Cuerpo -->
    <div class="cert-body">
      <p class="cert-eyebrow">Torneo Nacional de Robótica</p>
      <p class="cert-confiere">Confiere el presente</p>
      <p class="cert-titulo">Certificado a</p>
      <p class="cert-nombre">{{NOMBRE_PARTICIPANTE}}</p>
      <div class="cert-nombre-underline"></div>
      <p class="cert-logro">{{TEXTO_LOGRO}}</p>
    </div>

    <!-- Sello / roseta -->
    <div class="cert-seal">{{SELLO}}</div>

    <!-- Firmas -->
    <div class="cert-firmas">
      <div class="cert-firma">
        <div class="cert-firma-linea"></div>
        <p class="cert-firma-nombre">Ing. Christian Ortega MSc.</p>
        <p class="cert-firma-cargo">PRESIDENTE DEL COMITÉ ORGANIZADOR<br>SUCREBOT</p>
      </div>
      <div class="cert-firma">
        <div class="cert-firma-linea"></div>
        <p class="cert-firma-nombre">Ing. Fabricio Tipantocta MSc.</p>
        <p class="cert-firma-cargo">RELACIONES INTERINSTITUCIONALES<br>DEL COMITÉ ORGANIZADOR SUCREBOT</p>
      </div>
    </div>

  </div>

  <!-- Sidebar derecha -->
  <div class="cert-sidebar">
    <p class="cert-sb-title">Organiza</p>
    <div class="cert-sb-title-line"></div>
    <div class="cert-sb-block">
      <div class="cert-sb-carrera">
        <span class="small">Carrera</span>
        <strong>Electrónica</strong>
        <div class="bar"></div>
      </div>
    </div>
    <p class="cert-sb-title">Auspician</p>
    <div class="cert-sb-title-line"></div>
    <div class="cert-sb-block">
      <div class="cert-sb-logo-card">
        <img src="${LOGO_CLUB}" alt="Club Robótica Sucre" class="cert-sb-logo"/>
      </div>
    </div>
    <div class="cert-sb-spacer"></div>
    <div class="cert-sb-year">20<span>26</span></div>
    <div class="cert-sb-event">SucreBot</div>
  </div>

</div>
`;

const CERTIFICADO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500&family=DM+Mono:wght@400;500&display=swap');

.cert-wrap {
  width: 1123px;
  height: 794px;
  background: #ffffff;
  display: flex;
  position: relative;
  overflow: hidden;
  font-family: 'Exo 2', Arial, sans-serif;
  box-sizing: border-box;
}

/* Marco dorado/azul */
.cert-frame { position: absolute; inset: 18px; border: 1.5px solid #1a5ca8; z-index: 4; pointer-events: none; }
.cert-frame::before { content: ''; position: absolute; inset: 5px; border: 0.5px solid rgba(26,92,168,0.35); }

.cert-corner { position: absolute; width: 34px; height: 34px; z-index: 5; }
.cert-corner::before, .cert-corner::after { content: ''; position: absolute; background: #c9a24b; }
.cert-corner::before { width: 34px; height: 3px; }
.cert-corner::after  { width: 3px; height: 34px; }
.cc-tl { top: 14px; left: 14px; }
.cc-tr { top: 14px; right: 14px; }
.cc-tr::before { right: 0; } .cc-tr::after { right: 0; }
.cc-bl { bottom: 14px; left: 14px; }
.cc-bl::before { bottom: 0; } .cc-bl::after { bottom: 0; }
.cc-br { bottom: 14px; right: 14px; }
.cc-br::before { right: 0; bottom: 0; } .cc-br::after { right: 0; bottom: 0; }

/* Fondo geométrico */
.cert-geo { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.cert-geo-tri { position: absolute; }
.gt1 { width: 520px; height: 520px; top: -120px; left: -90px; background: linear-gradient(135deg,#f4f7fb 0%,#e8eef6 100%); clip-path: polygon(0 0,100% 0,0 100%); }
.gt2 { width: 360px; height: 360px; top: 40px; left: 60px; background: linear-gradient(135deg,#eef3f9 0%,#dfe8f3 100%); clip-path: polygon(0 0,100% 35%,25% 100%); }
.gt3 { width: 300px; height: 640px; bottom: -140px; left: -50px; background: linear-gradient(180deg,#eaf1f8 0%,#e0e9f4 100%); clip-path: polygon(45% 0,100% 100%,0 100%); }
.gt4 { width: 240px; height: 240px; bottom: 120px; left: 230px; background: #f1f5fa; clip-path: polygon(50% 0,100% 100%,0 100%); }
.gt5 { width: 180px; height: 300px; top: 200px; left: 380px; background: linear-gradient(160deg,#f6f9fc 0%,#eaf0f7 100%); clip-path: polygon(0 0,100% 25%,60% 100%); }

/* Columna principal */
.cert-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 54px 56px 40px 56px;
  position: relative;
  z-index: 2;
}

.cert-top { width: 100%; display: flex; justify-content: space-between; align-items: flex-start; position: absolute; top: 42px; left: 0; padding: 0 56px; }
.cert-fecha { font-size: 13px; color: #5b6677; font-style: italic; margin: 0; }
.cert-codigo { font-size: 9px; color: #aab4c2; font-family: 'DM Mono', monospace; letter-spacing: 1px; text-align: right; margin: 0; }

.cert-logo-top { margin-top: 18px; margin-bottom: 6px; }
.cert-logo-sucre { height: 84px; object-fit: contain; }

.cert-eyebrow { font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: #c9a24b; font-weight: 700; margin: 0 0 2px 0; }

.cert-body { text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
.cert-confiere { font-family: 'Playfair Display', serif; font-style: italic; font-size: 21px; color: #3a4555; margin: 0 0 4px 0; font-weight: 500; }
.cert-titulo { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 900; color: #1a5ca8; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 14px 0; line-height: 1; }
.cert-nombre { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #13325c; line-height: 1.05; max-width: 660px; margin: 0 0 6px 0; }
.cert-nombre-underline { width: 300px; height: 1.5px; background: linear-gradient(90deg,transparent,#c9a24b,transparent); margin: 0 auto 18px; }
.cert-logro { font-size: 14.5px; color: #3f4a59; line-height: 1.7; max-width: 600px; margin: 0 auto; }
.cert-logro strong { color: #1a5ca8; font-weight: 700; }

/* Sello / roseta */
.cert-seal { position: absolute; bottom: 96px; right: 54px; width: 120px; height: 158px; z-index: 3; }
.cert-seal svg { width: 100%; height: 100%; }

/* Firmas */
.cert-firmas { display: flex; justify-content: space-around; width: 100%; gap: 48px; margin-top: auto; padding-top: 10px; }
.cert-firma { flex: 1; text-align: center; }
.cert-firma-linea { width: 88%; height: 1.5px; background: #2b3a4d; margin: 0 auto 8px; }
.cert-firma-nombre { font-size: 14px; font-weight: 700; color: #13325c; margin: 0 0 2px 0; }
.cert-firma-cargo { font-size: 9.5px; font-weight: 700; color: #5b6677; text-transform: uppercase; letter-spacing: 0.4px; line-height: 1.4; margin: 0; }

/* Sidebar */
.cert-sidebar { width: 218px; background: linear-gradient(180deg,#16467e 0%,#1a5ca8 55%,#1a5ca8 100%); display: flex; flex-direction: column; align-items: center; padding: 48px 18px; position: relative; z-index: 2; }
.cert-sidebar::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: #c9a24b; }
.cert-sb-title { font-size: 13px; font-weight: 900; color: #ffffff; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 4px 0; text-align: center; }
.cert-sb-title-line { width: 38px; height: 2px; background: #c9a24b; margin-bottom: 18px; }
.cert-sb-block { width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 34px; }
.cert-sb-carrera { background: #fff; border-radius: 8px; padding: 14px 16px; text-align: center; width: 100%; }
.cert-sb-carrera .small { font-size: 15px; color: #2b3a4d; line-height: 1.1; }
.cert-sb-carrera strong { font-size: 21px; font-style: italic; color: #13325c; display: block; font-weight: 800; }
.cert-sb-carrera .bar { width: 34px; height: 3px; background: #1a5ca8; margin: 6px auto 0; }
.cert-sb-logo-card { background: #fff; border-radius: 10px; padding: 14px; width: 100%; display: flex; align-items: center; justify-content: center; }
.cert-sb-logo { width: 130px; object-fit: contain; }
.cert-sb-spacer { flex: 1; }
.cert-sb-year { color: #fff; font-family: 'Playfair Display', serif; font-weight: 900; font-size: 30px; letter-spacing: 1px; }
.cert-sb-year span { color: #c9a24b; }
.cert-sb-event { color: rgba(255,255,255,0.75); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px; }

/* Modal preview */
.cert-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: none; align-items: center; justify-content: center; padding: 20px; overflow: auto; }
.cert-modal.show { display: flex; }
.cert-modal-content { background: #ffffff; border-radius: 16px; padding: 30px; max-width: 1200px; width: 100%; max-height: 90vh; overflow: auto; position: relative; }
.cert-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.cert-modal-title { font-family: 'Orbitron', monospace; font-size: 1.2rem; color: #1a3a6b; }
.cert-modal-close { background: #ff4444; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; transition: all 0.2s; }
.cert-modal-close:hover { background: #cc0000; transform: scale(1.1); }
.cert-modal-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
.btn-modal { padding: 12px 24px; border: none; border-radius: 10px; font-family: 'Exo 2', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-guardar-cert { background: #3dd68c; color: white; }
.btn-guardar-cert:hover { background: #2ab870; transform: translateY(-2px); }
.btn-guardar-cert:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

// ── TEXTOS ────────────────────────────────────────────────────────────────────

function obtenerTextoLogro(tipo, categoria) {
  const textos = {
    '1er': `Por haber obtenido el <strong>PRIMER LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, demostrando excelencia técnica, innovación y espíritu competitivo.`,
    '2do': `Por haber obtenido el <strong>SEGUNDO LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, destacando por su desempeño técnico y habilidades en robótica.`,
    '3er': `Por haber obtenido el <strong>TERCER LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, reconociendo su dedicación y competencia técnica.`,
    'participacion': `Por su <strong>DESTACADA PARTICIPACIÓN</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, contribuyendo al desarrollo de la robótica y la innovación tecnológica en Ecuador.`
  };
  return textos[tipo] || textos['participacion'];
}

function obtenerDatosTipo(tipo) {
  const datos = {
    '1er':          { clase: 'primer',       badge: '🥇 PRIMER LUGAR'  },
    '2do':          { clase: 'segundo',      badge: '🥈 SEGUNDO LUGAR' },
    '3er':          { clase: 'tercer',       badge: '🥉 TERCER LUGAR'  },
    'participacion':{ clase: 'participacion',badge: '🏅 PARTICIPACIÓN' }
  };
  return datos[tipo] || datos['participacion'];
}

// ── SELLO / ROSETA SVG (sin emoji — se ve idéntico en el PDF) ─────────────────

function obtenerSelloSVG(tipo) {
  const conf = {
    '1er':          { star: '#c9a24b', fill: '#fdfaf2', ribbon: '#1a5ca8', ribbonShade: '#13427a', txt: '#8a6d28', label: '1er',     fontSize: 12  },
    '2do':          { star: '#9aa6b2', fill: '#f7f8fa', ribbon: '#5f6b78', ribbonShade: '#4a545f', txt: '#5f6b78', label: '2do',     fontSize: 12  },
    '3er':          { star: '#c87d4a', fill: '#fbf2ec', ribbon: '#a85f33', ribbonShade: '#8a4d28', txt: '#8a4f28', label: '3er',     fontSize: 12  },
    'participacion':{ star: '#1a5ca8', fill: '#eef3f9', ribbon: '#13325c', ribbonShade: '#0d2444', txt: '#1a5ca8', label: 'PARTIC.', fontSize: 8.5 }
  };
  const c = conf[tipo] || conf['participacion'];
  return `
    <svg viewBox="0 0 120 158" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 96 L44 150 L60 140 L76 150 L76 96 Z" fill="${c.ribbon}"/>
      <path d="M44 96 L44 150 L52 145 L52 96 Z" fill="${c.ribbonShade}"/>
      <circle cx="60" cy="56" r="54" fill="${c.fill}" stroke="${c.star}" stroke-width="2.5"/>
      <circle cx="60" cy="56" r="47" fill="none" stroke="${c.star}" stroke-width="0.8" opacity="0.55"/>
      <polygon points="60,20 68,44 93,44 73,59 81,83 60,68 39,83 47,59 27,44 52,44" fill="${c.star}"/>
      <text x="60" y="100" text-anchor="middle" font-family="Exo 2, Arial, sans-serif" font-size="${c.fontSize}" font-weight="900" fill="${c.txt}" letter-spacing="0.5">${c.label}</text>
    </svg>
  `;
}

// ── HTML DEL CERTIFICADO ──────────────────────────────────────────────────────

function buildCertHTML(nombreFinal, tipo, categoria, fechaEvento, codigo) {
  const textoLogro = obtenerTextoLogro(tipo, categoria);
  const sello      = obtenerSelloSVG(tipo);
  return CERTIFICADO_TEMPLATE
    .replace(/\{\{NOMBRE_PARTICIPANTE\}\}/g, nombreFinal)
    .replace(/\{\{TEXTO_LOGRO\}\}/g,         textoLogro)
    .replace(/\{\{FECHA_EVENTO\}\}/g,         fechaEvento)
    .replace(/\{\{CODIGO_VERIFICACION\}\}/g,  codigo)
    .replace(/\{\{SELLO\}\}/g,                sello);
}

// ── MODAL DE PREVIEW ──────────────────────────────────────────────────────────
//
// previewCertificado(participante, nombreFinal, pObj, _unused, tipo, fechaEvento)
//
// Parámetros:
//   participante  — índice numérico (modo legacy MI-REGISTRO) O null
//   nombreFinal   — string con el nombre humano a mostrar en el diploma
//   pObj          — objeto participante { nombre, correo, categoria, institucion }
//   _unused       — ignorado (era mIdxOverride en versión anterior)
//   tipo          — '1er' | '2do' | '3er' | 'participacion'
//   fechaEvento   — string con la fecha del evento
//
// Uso desde GENERAR-CERTIFICADOS:
//   previewCertificado(null, item.nombre, pFake, 0, tipoInterno, fechaEvento)
//
// Uso legacy desde MI-REGISTRO (si aún se usa índice):
//   previewCertificado(idx, null, participantesAprobados[idx], 0, tipo, fecha)
//
function previewCertificado(participante, nombreFinal, pObj, _unused, tipo, fechaEvento) {
  // Resolver el objeto participante
  const p = pObj || (typeof participantesAprobados !== 'undefined' && participante !== null
    ? participantesAprobados[participante]
    : {});

  // Resolver nombre: preferir nombreFinal explícito, luego p.nombre (NUNCA p.robot)
  const nombre   = (nombreFinal && String(nombreFinal).trim()) || (p && p.nombre) || '—';
  const categoria = (p && p.categoria) || '';
  const fecha    = fechaEvento || (typeof document !== 'undefined'
    ? (document.getElementById('fecha-evento')?.value || 'julio 2026')
    : 'julio 2026');
  const tipoFinal = tipo || 'participacion';

  const htmlCert = buildCertHTML(nombre, tipoFinal, categoria, fecha, 'CERT-2026-PREVIEW');

  // Crear/reusar modal
  let modal = document.getElementById('cert-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cert-modal';
    modal.className = 'cert-modal';

    const content = document.createElement('div');
    content.className = 'cert-modal-content';

    const header = document.createElement('div');
    header.className = 'cert-modal-header';

    const title = document.createElement('div');
    title.className = 'cert-modal-title';
    title.textContent = '📜 VISTA PREVIA DEL CERTIFICADO';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cert-modal-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = cerrarModalCertificado;

    header.appendChild(title);
    header.appendChild(closeBtn);

    const previewContainer = document.createElement('div');
    previewContainer.id = 'cert-preview-container';
    previewContainer.style.cssText = 'overflow-x:auto;';

    const actions = document.createElement('div');
    actions.className = 'cert-modal-actions';

    const saveBtn = document.createElement('button');
    saveBtn.id = 'btn-guardar-cert';
    saveBtn.className = 'btn-modal btn-guardar-cert';
    saveBtn.textContent = '☁️ Guardar en Drive';
    actions.appendChild(saveBtn);

    content.appendChild(header);
    content.appendChild(previewContainer);
    content.appendChild(actions);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  document.getElementById('cert-preview-container').innerHTML = htmlCert;

  // El botón de guardar desde preview solo aplica en el contexto legacy (MI-REGISTRO).
  // En GENERAR-CERTIFICADOS el botón de guardar es el "Generar" de la tabla.
  const saveBtn = document.getElementById('btn-guardar-cert');
  if (saveBtn) {
    if (typeof guardarYSubirCertificado === 'function' && participante !== null) {
      saveBtn.style.display = 'inline-flex';
      saveBtn.onclick = () => guardarYSubirCertificado(participante, nombre, tipoFinal);
    } else {
      // Modo GENERAR-CERTIFICADOS: solo preview, sin botón guardar redundante
      saveBtn.style.display = 'none';
    }
  }

  modal.classList.add('show');
}

function cerrarModalCertificado() {
  const modal = document.getElementById('cert-modal');
  if (modal) modal.classList.remove('show');
}

// ── GUARDAR DESDE MI-REGISTRO (legacy) ───────────────────────────────────────

async function guardarYSubirCertificado(idx, nombreOverride, tipoOverride) {
  // Solo se usa desde MI-REGISTRO donde existe participantesAprobados[]
  if (typeof participantesAprobados === 'undefined') return;
  const participante = participantesAprobados[idx];
  const nombreFinal  = nombreOverride || participante.nombre;
  const tipo         = tipoOverride   || 'participacion';
  const fechaEvento  = document.getElementById('fecha-evento')?.value || 'julio 2026';

  const saveBtn = document.getElementById('btn-guardar-cert');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Guardando...'; }
  if (typeof showToast === 'function') showToast('⏳ Guardando certificado en el sistema...');

  try {
    const response = await fetch(CONFIG.GAS_URL(), {
      method: 'POST',
      body: JSON.stringify({
        action:           'guardarCertificado',
        correo:           participante.correo,
        nombre_completo:  nombreFinal,
        categoria:        participante.categoria,
        institucion:      participante.institucion,
        evento:           'SucreBot 2026',
        fecha_evento:     fechaEvento,
        tipo_certificado: tipo
      }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    const result = await response.json();
    if (!result.ok) throw new Error('Error al guardar certificado en Sheets');

    const codigo = result.codigo;
    if (typeof showToast === 'function') showToast('⏳ Generando PDF y subiendo a Drive...');
    if (saveBtn) saveBtn.textContent = '⏳ Subiendo a Drive...';

    const driveUrl = await generarYSubirPDF(participante, tipo, fechaEvento, codigo, nombreFinal);
    cerrarModalCertificado();
    if (typeof showToast === 'function') showToast('✅ Diploma de ' + nombreFinal + ' guardado en Drive');
    console.log('Diploma subido:', driveUrl);

  } catch(e) {
    console.error('Error:', e);
    if (typeof showToast === 'function') showToast('❌ Error: ' + e.message);
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '☁️ Guardar en Drive'; }
  }
}

// ── GENERAR Y SUBIR PDF ───────────────────────────────────────────────────────
//
// generarYSubirPDF(pObj, tipo, fechaEvento, codigoCert, nombreFinal)
//
// pObj.categoria  — nombre de la categoría para el texto del logro
// nombreFinal     — nombre humano del miembro (capitán, miembro2 o miembro3)
//                   NUNCA usar pObj.robot aquí
//
async function generarYSubirPDF(pObj, tipo, fechaEvento, codigoCert, nombreFinal) {
  if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
    await cargarLibreriasPDF();
  }

  // Nombre a imprimir: siempre el parámetro explícito, nunca p.robot
  const nombre   = (nombreFinal && String(nombreFinal).trim()) || (pObj && pObj.nombre) || '—';
  const categoria = (pObj && pObj.categoria) || '';

  const htmlCert = buildCertHTML(nombre, tipo, categoria, fechaEvento, codigoCert);

  const tempDiv = document.createElement('div');
  tempDiv.style.position  = 'absolute';
  tempDiv.style.left      = '-9999px';
  tempDiv.style.top       = '0';
  tempDiv.innerHTML       = htmlCert;
  document.body.appendChild(tempDiv);

  try {
    await document.fonts.ready;
    const canvas = await html2canvas(tempDiv.firstElementChild, {
      scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff'
    });
    const { jsPDF } = jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    const fileName  = 'Diploma_' + nombre.replace(/\s+/g, '_') + '_' + codigoCert + '.pdf';

    const uploadResp = await fetch(CONFIG.GAS_URL(), {
      method: 'POST',
      body: JSON.stringify({ action: 'uploadDiploma', base64: pdfBase64, fileName, codigo: codigoCert }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    const uploadResult = await uploadResp.json();
    if (!uploadResult.ok) throw new Error(uploadResult.error || 'Error al subir a Drive');
    return uploadResult.url;
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// ── CARGAR LIBRERÍAS PDF ──────────────────────────────────────────────────────

async function cargarLibreriasPDF() {
  return new Promise((resolve, reject) => {
    const s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s2.onload = resolve; s2.onerror = reject;
      document.head.appendChild(s2);
    };
    s1.onerror = reject;
    document.head.appendChild(s1);
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────

(function initCertificados() {
  const style = document.createElement('style');
  style.textContent = CERTIFICADO_CSS;
  document.head.appendChild(style);
  console.log('✅ Sistema de certificados inicializado');
})();
