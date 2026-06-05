// ════════════════════════════════════════════════════════════════════════
// CERTIFICADOS.JS - Sistema de generación y subida de certificados a Drive
// Ubicación: /shared/js/certificados.js
// Versión: June 2026 — fix firma previewCertificado + generarYSubirPDF
// ════════════════════════════════════════════════════════════════════════

const LOGO_SUCRE = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/logosucre.png';
const LOGO_CLUB  = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/club-robotica-fondo-blanco.png';

const CERTIFICADO_TEMPLATE = `
<div class="cert-wrap" id="certificado-preview">

  <!-- Fondo geométrico -->
  <div class="cert-geo">
    <div class="cert-geo-tri cert-geo-tri1"></div>
    <div class="cert-geo-tri cert-geo-tri2"></div>
    <div class="cert-geo-tri cert-geo-tri3"></div>
    <div class="cert-geo-tri cert-geo-tri4"></div>
  </div>

  <!-- Columna principal -->
  <div class="cert-main">

    <!-- Fecha y código en la esquina superior izquierda -->
    <div class="cert-top-info">
      <p class="cert-fecha">Quito D.M., {{FECHA_EVENTO}}</p>
      <p class="cert-codigo">{{CODIGO_VERIFICACION}}</p>
    </div>

    <!-- Logo Instituto Sucre centrado -->
    <div class="cert-logo-top">
      <img src="${LOGO_SUCRE}" alt="Instituto Superior Universitario Sucre" class="cert-logo-sucre"/>
    </div>

    <!-- Cuerpo -->
    <div class="cert-body">
      <p class="cert-confiere">Confiere el presente</p>
      <div class="cert-titulo-wrap">
        <p class="cert-titulo">CERTIFICADO A:</p>
      </div>
      <p class="cert-nombre">{{NOMBRE_PARTICIPANTE}}</p>
      <p class="cert-logro">{{TEXTO_LOGRO}}</p>
    </div>

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
    <p class="cert-sidebar-title">ORGANIZA</p>
    <div class="cert-sidebar-logo-wrap">
      <span class="cert-sidebar-carrera">Carrera<br><strong>Electrónica</strong></span>
    </div>
    <p class="cert-sidebar-title" style="margin-top:24px;">AUSPICIAN</p>
    <div class="cert-sidebar-logo-wrap">
      <img src="${LOGO_CLUB}" alt="Club Robótica Sucre" class="cert-sidebar-logo"/>
    </div>
  </div>

</div>
`;

const CERTIFICADO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700;900&display=swap');

.cert-wrap {
  width: 1123px;
  height: 794px;
  background: #f0f0f0;
  display: flex;
  position: relative;
  overflow: hidden;
  font-family: 'Exo 2', Arial, sans-serif;
  box-sizing: border-box;
}

.cert-geo { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.cert-geo-tri { position: absolute; background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(220,225,235,0.4) 100%); }
.cert-geo-tri1 { width: 480px; height: 480px; top: -80px; left: -60px; clip-path: polygon(0 0, 100% 0, 0 100%); transform: rotate(-10deg); }
.cert-geo-tri2 { width: 380px; height: 380px; top: 60px; left: 80px; clip-path: polygon(0 0, 100% 30%, 20% 100%); transform: rotate(5deg); background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(200,210,225,0.3) 100%); }
.cert-geo-tri3 { width: 300px; height: 600px; bottom: -100px; left: -40px; clip-path: polygon(40% 0, 100% 100%, 0 100%); background: linear-gradient(180deg, rgba(180,195,215,0.25) 0%, rgba(150,170,200,0.15) 100%); }
.cert-geo-tri4 { width: 200px; height: 300px; bottom: 100px; left: 200px; clip-path: polygon(50% 0, 100% 100%, 0 100%); background: rgba(255,255,255,0.5); transform: rotate(-15deg); }

.cert-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 48px 28px 48px;
  position: relative;
  z-index: 1;
  border-right: 1px solid rgba(26,92,168,0.15);
}

.cert-top-info { width: 100%; text-align: left; margin-bottom: 8px; }
.cert-fecha { font-size: 13px; color: #555; margin: 0; font-style: italic; }
.cert-codigo { font-size: 9px; color: #aaa; font-family: monospace; margin: 2px 0 0 0; letter-spacing: 1px; }

.cert-logo-top { margin-bottom: 8px; }
.cert-logo-sucre { height: 80px; object-fit: contain; }

.cert-body {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cert-confiere { font-size: 18px; color: #333; margin: 0 0 6px 0; font-weight: 400; }
.cert-titulo-wrap { margin-bottom: 10px; }
.cert-titulo { font-size: 36px; font-weight: 900; color: #1a5ca8; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
.cert-nombre { font-size: 42px; font-weight: 900; color: #1a3a6b; margin: 4px 0 16px 0; line-height: 1.1; text-align: center; max-width: 680px; }
.cert-logro { font-size: 14px; color: #444; line-height: 1.6; max-width: 600px; margin: 0 auto; text-align: center; }
.cert-logro strong { color: #1a5ca8; font-weight: 700; }

.cert-firmas { display: flex; justify-content: space-around; width: 100%; gap: 40px; margin-top: auto; }
.cert-firma { flex: 1; text-align: center; }
.cert-firma-linea { width: 100%; height: 1.5px; background: #333; margin-bottom: 8px; }
.cert-firma-nombre { font-size: 13px; font-weight: 700; color: #1a3a6b; margin: 0 0 3px 0; }
.cert-firma-cargo { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; line-height: 1.4; }

.cert-sidebar { width: 200px; background: #ffffff; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; position: relative; z-index: 1; }
.cert-sidebar-title { font-size: 14px; font-weight: 900; color: #1a3a6b; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0; text-align: center; }
.cert-sidebar-logo-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.cert-sidebar-carrera { font-size: 14px; color: #333; text-align: center; line-height: 1.4; border-left: 3px solid #1a5ca8; padding-left: 8px; }
.cert-sidebar-carrera strong { font-size: 18px; font-style: italic; color: #1a3a6b; display: block; }
.cert-sidebar-logo { width: 140px; object-fit: contain; background: #f0f0f0; border-radius: 8px; padding: 8px; }

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

// ── HTML DEL CERTIFICADO ──────────────────────────────────────────────────────

function buildCertHTML(nombreFinal, tipo, categoria, fechaEvento, codigo) {
  const textoLogro = obtenerTextoLogro(tipo, categoria);
  return CERTIFICADO_TEMPLATE
    .replace(/\{\{NOMBRE_PARTICIPANTE\}\}/g, nombreFinal)
    .replace(/\{\{TEXTO_LOGRO\}\}/g,         textoLogro)
    .replace(/\{\{FECHA_EVENTO\}\}/g,         fechaEvento)
    .replace(/\{\{CODIGO_VERIFICACION\}\}/g,  codigo);
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
      scale: 2, useCORS: true, logging: false, backgroundColor: '#f0f0f0'
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
