// ════════════════════════════════════════════════════════════════════════
// CERTIFICADOS.JS - Sistema de generación y descarga de certificados
// Ubicación: /shared/js/certificados.js
// ════════════════════════════════════════════════════════════════════════

// Template HTML del certificado
const CERTIFICADO_TEMPLATE = `
<div class="certificado-container" id="certificado-preview">
  <div class="certificado-bg"></div>
  <div class="certificado-border"></div>
  <div class="cert-badge {{TIPO_CLASS}}">{{TIPO_BADGE}}</div>
  
  <div class="certificado-content">
    <div class="cert-header">
      <div class="cert-logo">🏛️</div>
      <div class="cert-institution">Instituto Superior Universitario Sucre</div>
      <div class="cert-institution" style="font-size: 13px; margin-top: 5px;">Club de Robótica Sucre</div>
    </div>
    
    <div class="cert-title">
      <div class="cert-title-main">CERTIFICADO</div>
      <div class="cert-subtitle">De Reconocimiento</div>
    </div>
    
    <div class="cert-conferir">Confiere el presente certificado a:</div>
    
    <div class="cert-nombre">{{NOMBRE_PARTICIPANTE}}</div>
    
    <div class="cert-logro">{{TEXTO_LOGRO}}</div>
    
    <div class="cert-detalles">
      <strong>Categoría:</strong> {{CATEGORIA}} <br>
      <strong>Evento:</strong> {{EVENTO}} | {{FECHA_EVENTO}}
    </div>
    
    <div class="cert-footer">
      <div class="cert-firma">
        <div class="cert-firma-linea">
          <span class="cert-firma-nombre">Christian Ortega</span>
        </div>
        <div class="cert-firma-cargo">Presidente del Comité Organizador</div>
      </div>
      <div class="cert-firma">
        <div class="cert-firma-linea">
          <span class="cert-firma-nombre">Fabricio Tipantocta</span>
        </div>
        <div class="cert-firma-cargo">Coordinador de Relaciones</div>
      </div>
    </div>
  </div>
  
  <div class="cert-auspiciantes">
    <div class="cert-auspiciante-logo" title="Carrera Electrónica">⚡</div>
    <div class="cert-auspiciante-logo" title="Club Robótica Sucre">🤖</div>
    <div class="cert-auspiciante-logo" title="EPN">🎓</div>
    <div class="cert-auspiciante-logo" title="BitBot Team">💻</div>
    <div class="cert-auspiciante-logo" title="Rivaluz">💡</div>
  </div>
  
  <div class="cert-qr">
    <div class="cert-qr-code"><span style="font-size: 48px;">⬛</span></div>
    <div class="cert-qr-codigo">{{CODIGO_VERIFICACION}}</div>
  </div>
</div>
`;

// CSS del certificado
const CERTIFICADO_CSS = `
.certificado-container {
  width: 1123px;
  height: 794px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Exo 2', sans-serif;
  margin: 0 auto;
}
.certificado-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.08;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 35px, #1a5ca8 35px, #1a5ca8 70px),
    repeating-linear-gradient(-45deg, transparent, transparent 35px, #1a5ca8 35px, #1a5ca8 70px);
}
.certificado-border {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  bottom: 30px;
  border: 8px solid #1a5ca8;
  border-radius: 20px;
  box-shadow: inset 0 0 0 4px #ffffff, inset 0 0 0 8px #d4af37;
}
.certificado-content {
  position: relative;
  z-index: 2;
  padding: 60px 80px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.cert-header { text-align: center; margin-bottom: 30px; }
.cert-logo { font-size: 48px; margin-bottom: 10px; }
.cert-institution { font-size: 16px; font-weight: 700; color: #1a5ca8; letter-spacing: 2px; text-transform: uppercase; }
.cert-title { text-align: center; margin: 20px 0; }
.cert-title-main { font-size: 56px; font-weight: 900; color: #1a5ca8; letter-spacing: 8px; text-transform: uppercase; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
.cert-subtitle { font-size: 14px; color: #666; margin-top: 8px; letter-spacing: 3px; text-transform: uppercase; }
.cert-conferir { text-align: center; font-size: 18px; color: #333; margin: 25px 0 20px; letter-spacing: 1px; }
.cert-nombre { text-align: center; font-family: 'Great Vibes', cursive; font-size: 64px; color: #1a3a6b; margin: 20px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); border-bottom: 3px solid #d4af37; padding-bottom: 10px; max-width: 800px; margin-left: auto; margin-right: auto; }
.cert-logro { text-align: center; font-size: 18px; color: #333; line-height: 1.8; margin: 25px 0; max-width: 900px; margin-left: auto; margin-right: auto; }
.cert-logro strong { color: #1a5ca8; font-weight: 900; }
.cert-detalles { text-align: center; font-size: 16px; color: #555; margin: 20px 0; }
.cert-detalles strong { color: #1a5ca8; font-weight: 700; }
.cert-footer { margin-top: auto; display: flex; justify-content: space-around; align-items: flex-end; padding: 0 60px; }
.cert-firma { text-align: center; flex: 1; }
.cert-firma-linea { width: 280px; height: 2px; background: #333; margin: 0 auto 10px; position: relative; }
.cert-firma-nombre { font-family: 'Great Vibes', cursive; font-size: 32px; color: #1a3a6b; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); white-space: nowrap; }
.cert-firma-cargo { font-size: 13px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1px; }
.cert-auspiciantes { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 15px; align-items: center; }
.cert-auspiciante-logo { width: 80px; height: 80px; background: rgba(255,255,255,0.9); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 2px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.cert-qr { position: absolute; bottom: 40px; right: 40px; text-align: center; }
.cert-qr-code { width: 100px; height: 100px; background: #ffffff; border: 3px solid #1a5ca8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; margin-bottom: 5px; }
.cert-qr-codigo { font-size: 10px; color: #999; font-family: monospace; }
.cert-badge { position: absolute; top: 50px; right: 50px; padding: 12px 24px; border-radius: 30px; font-weight: 900; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.cert-badge.primer { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #8b6914; border: 3px solid #b8860b; }
.cert-badge.segundo { background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%); color: #4a4a4a; border: 3px solid #808080; }
.cert-badge.tercer { background: linear-gradient(135deg, #cd7f32 0%, #e89a5d 100%); color: #ffffff; border: 3px solid #8b5a2b; }
.cert-badge.participacion { background: linear-gradient(135deg, #1a5ca8 0%, #2980b9 100%); color: #ffffff; border: 3px solid #0d3a6b; }

/* Modal para preview */
.cert-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: none; align-items: center; justify-content: center; padding: 20px; overflow: auto; }
.cert-modal.show { display: flex; }
.cert-modal-content { background: #ffffff; border-radius: 16px; padding: 30px; max-width: 1200px; width: 100%; max-height: 90vh; overflow: auto; position: relative; }
.cert-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.cert-modal-title { font-family: 'Orbitron', monospace; font-size: 1.2rem; color: #1a3a6b; }
.cert-modal-close { background: #ff4444; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; transition: all 0.2s; }
.cert-modal-close:hover { background: #cc0000; transform: scale(1.1); }
.cert-modal-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
.btn-modal { padding: 12px 24px; border: none; border-radius: 10px; font-family: 'Exo 2', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-descargar-pdf { background: #1a5ca8; color: white; }
.btn-descargar-pdf:hover { background: #0f3d75; transform: translateY(-2px); }
.btn-guardar-cert { background: #3dd68c; color: white; }
.btn-guardar-cert:hover { background: #2ab870; transform: translateY(-2px); }
`;

// Función para obtener texto según tipo de certificado
function obtenerTextoLogro(tipo, categoria) {
  const textos = {
    '1er': `Por haber obtenido el <strong>PRIMER LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, demostrando excelencia técnica, innovación y espíritu competitivo.`,
    '2do': `Por haber obtenido el <strong>SEGUNDO LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, destacando por su desempeño técnico y habilidades en robótica.`,
    '3er': `Por haber obtenido el <strong>TERCER LUGAR</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, reconociendo su dedicación y competencia técnica.`,
    'participacion': `Por su <strong>DESTACADA PARTICIPACIÓN</strong> en la categoría <strong>${categoria}</strong> del Torneo Nacional de Robótica SucreBot 2026, contribuyendo al desarrollo de la robótica y la innovación tecnológica en Ecuador.`
  };
  return textos[tipo] || textos['participacion'];
}

// Función para obtener clase y badge según tipo
function obtenerDatosTipo(tipo) {
  const datos = {
    '1er': { clase: 'primer', badge: '🥇 PRIMER LUGAR' },
    '2do': { clase: 'segundo', badge: '🥈 SEGUNDO LUGAR' },
    '3er': { clase: 'tercer', badge: '🥉 TERCER LUGAR' },
    'participacion': { clase: 'participacion', badge: '🏅 PARTICIPACIÓN' }
  };
  return datos[tipo] || datos['participacion'];
}

// Función para preview del certificado
function previewCertificado(idx) {
  const participante = participantesAprobados[idx];
  const tipo = document.getElementById('tipo-' + idx).value;
  const fechaEvento = document.getElementById('fecha-evento').value;
  
  // Obtener datos del tipo
  const datosTipo = obtenerDatosTipo(tipo);
  const textoLogro = obtenerTextoLogro(tipo, participante.categoria);
  
  // Generar código de verificación temporal
  const codigoTemp = 'CERT-2026-PREVIEW';
  
  // Reemplazar variables en el template
  let htmlCert = CERTIFICADO_TEMPLATE
    .replace(/\{\{TIPO_CLASS\}\}/g, datosTipo.clase)
    .replace(/\{\{TIPO_BADGE\}\}/g, datosTipo.badge)
    .replace(/\{\{NOMBRE_PARTICIPANTE\}\}/g, participante.nombre)
    .replace(/\{\{TEXTO_LOGRO\}\}/g, textoLogro)
    .replace(/\{\{CATEGORIA\}\}/g, participante.categoria)
    .replace(/\{\{EVENTO\}\}/g, 'SucreBot 2026')
    .replace(/\{\{FECHA_EVENTO\}\}/g, fechaEvento)
    .replace(/\{\{CODIGO_VERIFICACION\}\}/g, codigoTemp);
  
  // Crear modal si no existe
  let modal = document.getElementById('cert-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cert-modal';
    modal.className = 'cert-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'cert-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'cert-modal-header';
    
    const modalTitle = document.createElement('div');
    modalTitle.className = 'cert-modal-title';
    modalTitle.textContent = '📜 VISTA PREVIA DEL CERTIFICADO';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cert-modal-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = cerrarModalCertificado;
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    const previewContainer = document.createElement('div');
    previewContainer.id = 'cert-preview-container';
    
    const actions = document.createElement('div');
    actions.className = 'cert-modal-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-modal btn-guardar-cert';
    saveBtn.textContent = '💾 Guardar y Descargar PDF';
    saveBtn.onclick = function() { guardarYDescargarCertificado(idx); };
    
    actions.appendChild(saveBtn);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(previewContainer);
    modalContent.appendChild(actions);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  
  // Insertar certificado en el modal
  document.getElementById('cert-preview-container').innerHTML = htmlCert;
  
  // Mostrar modal
  modal.classList.add('show');
}

// Función para cerrar modal
function cerrarModalCertificado() {
  const modal = document.getElementById('cert-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Función para guardar certificado y descargar PDF
async function guardarYDescargarCertificado(idx) {
  const participante = participantesAprobados[idx];
  const tipo = document.getElementById('tipo-' + idx).value;
  const fechaEvento = document.getElementById('fecha-evento').value;
  
  showToast('⏳ Guardando certificado en el sistema...');
  
  try {
    // Guardar en Google Sheets
    const data = {
      action: 'guardarCertificado',
      correo: participante.correo,
      nombre_completo: participante.nombre,
      categoria: participante.categoria,
      institucion: participante.institucion,
      evento: 'SucreBot 2026',
      fecha_evento: fechaEvento,
      tipo_certificado: tipo
    };
    
    const response = await fetch(CONFIG.GAS_URL(), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    
    const result = await response.json();
    
    if (result.ok) {
      showToast('✅ Certificado guardado. Generando PDF...');
      
      // Generar el PDF con el código real
      await descargarCertificadoPDF(participante, tipo, fechaEvento, result.codigo);
      
      cerrarModalCertificado();
      showToast('✅ PDF descargado correctamente');
    } else {
      throw new Error('Error al guardar certificado');
    }
    
  } catch (e) {
    console.error('Error:', e);
    showToast('❌ Error: ' + e.message);
  }
}

// Función para descargar certificado como PDF
async function descargarCertificadoPDF(participante, tipo, fechaEvento, codigoCert) {
  // Cargar librerías si no están cargadas
  if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
    showToast('⏳ Cargando librerías PDF...');
    await cargarLibreriasPDF();
  }
  
  showToast('🎨 Generando PDF...');
  
  // Obtener datos del tipo
  const datosTipo = obtenerDatosTipo(tipo);
  const textoLogro = obtenerTextoLogro(tipo, participante.categoria);
  
  // Crear elemento temporal con el certificado
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.innerHTML = CERTIFICADO_TEMPLATE
    .replace(/\{\{TIPO_CLASS\}\}/g, datosTipo.clase)
    .replace(/\{\{TIPO_BADGE\}\}/g, datosTipo.badge)
    .replace(/\{\{NOMBRE_PARTICIPANTE\}\}/g, participante.nombre)
    .replace(/\{\{TEXTO_LOGRO\}\}/g, textoLogro)
    .replace(/\{\{CATEGORIA\}\}/g, participante.categoria)
    .replace(/\{\{EVENTO\}\}/g, 'SucreBot 2026')
    .replace(/\{\{FECHA_EVENTO\}\}/g, fechaEvento)
    .replace(/\{\{CODIGO_VERIFICACION\}\}/g, codigoCert);
  
  document.body.appendChild(tempDiv);
  
  try {
    // Convertir a canvas
    const canvas = await html2canvas(tempDiv.firstElementChild, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Crear PDF
    const { jsPDF } = jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
    
    // Descargar
    const nombreArchivo = `Certificado_${participante.nombre.replace(/\s+/g, '_')}_${codigoCert}.pdf`;
    pdf.save(nombreArchivo);
    
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// Función para cargar librerías PDF
async function cargarLibreriasPDF() {
  return new Promise((resolve, reject) => {
    // Cargar html2canvas
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script1.onload = () => {
      // Cargar jsPDF
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script2.onload = resolve;
      script2.onerror = reject;
      document.head.appendChild(script2);
    };
    script1.onerror = reject;
    document.head.appendChild(script1);
  });
}

// Inicializar CSS y fuentes al cargar el script
(function initCertificados() {
  // Agregar CSS del certificado
  const style = document.createElement('style');
  style.textContent = CERTIFICADO_CSS;
  document.head.appendChild(style);
  
  // Agregar fuente Great Vibes
  const linkFont = document.createElement('link');
  linkFont.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
  linkFont.rel = 'stylesheet';
  document.head.appendChild(linkFont);
  
  console.log('✅ Sistema de certificados inicializado');
})();
