// ════════════════════════════════════════════════════════════════════════
// CERTIFICADOS.JS - Sistema de generación y subida de certificados a Drive
// Ubicación: /shared/js/certificados.js
// Versión: Junio 2026 — rediseño serio/formal (bandas azules, EB Garamond, sin sidebar)
// ════════════════════════════════════════════════════════════════════════

const LOGO_SUCRE = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/logosucre.png';

const CERTIFICADO_TEMPLATE = `
<div class="cert" id="certificado-preview">

  <div class="cert-top-band"></div>

  <!-- Fondo geométrico -->
  <div class="cert-bg">
    <svg viewBox="0 0 1122 793" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#eef3fa" stop-opacity="1"/>
          <stop offset="100%" stop-color="#dde8f4" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="cg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e8f0f8" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#cfe0f0" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="0,0 500,0 0,500" fill="url(#cg1)"/>
      <polygon points="0,0 320,0 0,320" fill="url(#cg2)" opacity="0.7"/>
      <polygon points="0,200 280,0 0,600" fill="#e4eef8" opacity="0.4"/>
      <polygon points="0,400 380,793 0,793" fill="#dce8f5" opacity="0.5"/>
      <polygon points="120,793 480,300 560,793" fill="#e8f0f8" opacity="0.35"/>
    </svg>
  </div>

  <!-- Líneas verticales decorativas -->
  <div class="cert-line-l"></div>
  <div class="cert-line-r"></div>

  <!-- Cuerpo -->
  <div class="cert-body">
    <img src="${LOGO_SUCRE}" alt="Instituto Superior Universitario Sucre" class="cert-logo"/>
    <div class="cert-divider"></div>
    <p class="cert-confiere">Confiere el presente</p>
    <p class="cert-titulo">Certificado a:</p>
    <p class="cert-nombre">{{NOMBRE_PARTICIPANTE}}</p>
    <div class="cert-divider-thin"></div>
    <p class="cert-logro">{{TEXTO_LOGRO}}</p>
  </div>

  <!-- Sello / roseta -->
  <div class="cert-sello">{{SELLO}}</div>

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

  <!-- Fecha y código -->
  <div class="cert-meta">
    <p class="cert-fecha">Quito D.M., {{FECHA_EVENTO}}</p>
    <p class="cert-codigo">{{CODIGO_VERIFICACION}}</p>
  </div>

  <div class="cert-bottom-band"></div>
</div>
`;

const CERTIFICADO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Exo+2:wght@300;400;600;700;800;900&display=swap');

.cert {
  width: 1122px;
  height: 793px;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  font-family: 'Exo 2', Arial, sans-serif;
}

/* Bandas azules */
.cert-top-band, .cert-bottom-band {
  width: 100%; height: 12px; flex-shrink: 0;
  background: linear-gradient(90deg, #0a2a5e 0%, #1a5ca8 50%, #0a2a5e 100%);
}
.cert-bottom-band { margin-top: auto; }

/* Fondo geométrico */
.cert-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.cert-bg svg { width: 100%; height: 100%; }

/* Líneas verticales */
.cert-line-l, .cert-line-r {
  position: absolute; top: 12px; bottom: 12px; width: 4px; z-index: 2;
}
.cert-line-l { left: 52px; background: linear-gradient(180deg,transparent,#1a5ca8 20%,#1a5ca8 80%,transparent); }
.cert-line-r { right: 52px; background: linear-gradient(180deg,transparent,#1a5ca8 20%,#1a5ca8 80%,transparent); }
.cert-line-l::after, .cert-line-r::after {
  content: ''; position: absolute; width: 12px; height: 12px;
  background: #1a5ca8; border-radius: 50%;
  left: 50%; transform: translateX(-50%); top: 40px;
}

/* Cuerpo */
.cert-body {
  position: relative; z-index: 3;
  width: 100%; flex: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 30px 100px 0;
}

.cert-logo { height: 90px; object-fit: contain; margin-bottom: 18px; }

.cert-divider {
  width: 480px; height: 1px;
  background: linear-gradient(90deg, transparent, #1a5ca8 30%, #1a5ca8 70%, transparent);
  margin-bottom: 18px;
}
.cert-divider-thin {
  width: 280px; height: 1px;
  background: linear-gradient(90deg, transparent, #b8c8dc, transparent);
  margin-bottom: 20px;
}

.cert-confiere {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 20px; font-style: italic; color: #4a5568;
  margin: 0 0 6px 0; letter-spacing: 0.5px;
}
.cert-titulo {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 42px; font-weight: 700; color: #0a2a5e;
  letter-spacing: 3px; text-transform: uppercase;
  margin: 0 0 10px 0;
}
.cert-nombre {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 52px; font-weight: 600; color: #0a2a5e;
  letter-spacing: 1px; line-height: 1.1;
  max-width: 860px; text-align: center;
  margin: 0 0 10px 0;
}
.cert-logro {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 18px; color: #4a5568; line-height: 1.8;
  max-width: 720px; text-align: center; margin: 0 auto;
}
.cert-logro strong { color: #0a2a5e; font-weight: 700; }

/* Sello */
.cert-sello { position: absolute; bottom: 54px; right: 70px; z-index: 4; }
.cert-sello svg { width: 110px; height: 145px; }

/* Firmas */
.cert-firmas {
  position: absolute; bottom: 52px; width: 100%;
  display: flex; justify-content: space-around;
  padding: 0 120px; z-index: 3;
}
.cert-firma { text-align: center; min-width: 240px; }
.cert-firma-linea { width: 200px; height: 1px; background: #2b3a4d; margin: 0 auto 8px; }
.cert-firma-nombre { font-size: 14px; font-weight: 700; color: #0a2a5e; margin: 0 0 3px 0; font-family: 'Exo 2', sans-serif; }
.cert-firma-cargo { font-size: 9px; font-weight: 700; color: #5b6677; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.5; margin: 0; font-family: 'Exo 2', sans-serif; }

/* Fecha y código */
.cert-meta {
  position: absolute; bottom: 20px; width: 100%;
  display: flex; justify-content: space-between; align-items: flex-end;
  padding: 0 100px; z-index: 3;
}
.cert-fecha { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: #4a5568; font-style: italic; margin: 0; }
.cert-codigo { font-size: 9px; color: #b0b8c4; letter-spacing: 1px; font-family: monospace; margin: 0; }

/* Modal */
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

// ── TEXTOS ─────────────────────────────────────────────────────────────────────

function obtenerTextoLogro(tipo, categoria) {
  const textos = {
    '1er':          `Por haber obtenido el <strong>PRIMER LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, demostrando excelencia técnica, innovación y espíritu competitivo.`,
    '2do':          `Por haber obtenido el <strong>SEGUNDO LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, destacando por su desempeño técnico y habilidades en robótica.`,
    '3er':          `Por haber obtenido el <strong>TERCER LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, reconociendo su dedicación y competencia técnica.`,
    'participacion':`Por su <strong>DESTACADA PARTICIPACIÓN</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, contribuyendo al desarrollo de la robótica y la innovación tecnológica en Ecuador.`
  };
  return textos[tipo] || textos['participacion'];
}

function obtenerDatosTipo(tipo) {
  const datos = {
    '1er':          { clase: 'primer',        badge: '1er LUGAR'   },
    '2do':          { clase: 'segundo',       badge: '2do LUGAR'   },
    '3er':          { clase: 'tercer',        badge: '3er LUGAR'   },
    'participacion':{ clase: 'participacion', badge: 'PARTICIPACIÓN'}
  };
  return datos[tipo] || datos['participacion'];
}

// ── SELLO / ROSETA SVG ────────────────────────────────────────────────────────

function obtenerSelloSVG(tipo) {
  const conf = {
    '1er':          { star: '#c9a24b', fill: '#fdfaf2', ribbon: '#1a5ca8', ribbonShade: '#0a2a5e', txt: '#8a6d28', label: '1er',     fontSize: 12  },
    '2do':          { star: '#9aa6b2', fill: '#f7f8fa', ribbon: '#5f6b78', ribbonShade: '#4a545f', txt: '#5f6b78', label: '2do',     fontSize: 12  },
    '3er':          { star: '#c87d4a', fill: '#fbf2ec', ribbon: '#a85f33', ribbonShade: '#8a4d28', txt: '#8a4f28', label: '3er',     fontSize: 12  },
    'participacion':{ star: '#1a5ca8', fill: '#eef3f9', ribbon: '#13325c', ribbonShade: '#0d2444', txt: '#1a5ca8', label: 'PARTIC.', fontSize: 8.5 }
  };
  const c = conf[tipo] || conf['participacion'];
  return `<svg viewBox="0 0 120 158" xmlns="http://www.w3.org/2000/svg">
    <path d="M44 96 L44 150 L60 140 L76 150 L76 96 Z" fill="${c.ribbon}"/>
    <path d="M44 96 L44 150 L52 145 L52 96 Z" fill="${c.ribbonShade}"/>
    <circle cx="60" cy="56" r="54" fill="${c.fill}" stroke="${c.star}" stroke-width="2.5"/>
    <circle cx="60" cy="56" r="47" fill="none" stroke="${c.star}" stroke-width="0.8" opacity="0.55"/>
    <polygon points="60,20 68,44 93,44 73,59 81,83 60,68 39,83 47,59 27,44 52,44" fill="${c.star}"/>
    <text x="60" y="100" text-anchor="middle" font-family="Exo 2,Arial,sans-serif" font-size="${c.fontSize}" font-weight="900" fill="${c.txt}" letter-spacing="0.5">${c.label}</text>
  </svg>`;
}

// ── HTML DEL CERTIFICADO ───────────────────────────────────────────────────────

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

// ── MODAL DE PREVIEW ───────────────────────────────────────────────────────────

function previewCertificado(participante, nombreFinal, pObj, _unused, tipo, fechaEvento) {
  const p        = pObj || (typeof participantesAprobados !== 'undefined' && participante !== null ? participantesAprobados[participante] : {});
  const nombre   = (nombreFinal && String(nombreFinal).trim()) || (p && p.nombre) || '—';
  const categoria = (p && p.categoria) || '';
  const fecha    = fechaEvento || (document.getElementById('fecha-evento')?.value || 'julio 2026');
  const tipoFinal = tipo || 'participacion';
  const htmlCert = buildCertHTML(nombre, tipoFinal, categoria, fecha, 'CERT-2026-PREVIEW');

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

  const saveBtn = document.getElementById('btn-guardar-cert');
  if (saveBtn) {
    if (typeof guardarYSubirCertificado === 'function' && participante !== null) {
      saveBtn.style.display = 'inline-flex';
      saveBtn.onclick = () => guardarYSubirCertificado(participante, nombre, tipoFinal);
    } else {
      saveBtn.style.display = 'none';
    }
  }

  modal.classList.add('show');
}

function cerrarModalCertificado() {
  const modal = document.getElementById('cert-modal');
  if (modal) modal.classList.remove('show');
}

// ── GUARDAR DESDE MI-REGISTRO (legacy) ────────────────────────────────────────

async function guardarYSubirCertificado(idx, nombreOverride, tipoOverride) {
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
        action: 'guardarCertificado',
        correo: participante.correo, nombre_completo: nombreFinal,
        categoria: participante.categoria, institucion: participante.institucion,
        evento: 'SucreBot 2026', fecha_evento: fechaEvento, tipo_certificado: tipo
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

// ── GENERAR Y SUBIR PDF ────────────────────────────────────────────────────────

async function generarYSubirPDF(pObj, tipo, fechaEvento, codigoCert, nombreFinal) {
  if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
    await cargarLibreriasPDF();
  }
  const nombre    = (nombreFinal && String(nombreFinal).trim()) || (pObj && pObj.nombre) || '—';
  const categoria = (pObj && pObj.categoria) || '';
  const htmlCert  = buildCertHTML(nombre, tipo, categoria, fechaEvento, codigoCert);

  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0;';
  tempDiv.innerHTML = htmlCert;
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

// ── CARGAR LIBRERÍAS PDF ───────────────────────────────────────────────────────

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

// ── INIT ───────────────────────────────────────────────────────────────────────

(function initCertificados() {
  const style = document.createElement('style');
  style.textContent = CERTIFICADO_CSS;
  document.head.appendChild(style);
  console.log('✅ Sistema de certificados inicializado');
})();
