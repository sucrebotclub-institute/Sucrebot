/**
 * OfflineExcel — modo de contingencia sin internet para SucreBot
 * Usa File System Access API (Chrome/Edge, misma limitación que Web Serial)
 * para leer/escribir un archivo .xlsx local que sirve como base de datos
 * mientras no hay conexión a Google Sheets/GAS.
 *
 * Flujo:
 *  1) Con internet, ANTES del corte: OfflineExcel.crearNuevo() crea el archivo local
 *     y OfflineExcel.importarParticipantesDesdeGAS(gasUrl) lo llena con los
 *     participantes aprobados actuales.
 *  2) Sin internet: OfflineExcel.activar() reabre ese mismo archivo. Los módulos
 *     (CRONOMETRO, etc.) leen participantes con getParticipantes(categoria) y
 *     guardan resultados con guardarResultado(data) — todo se escribe en el
 *     archivo local en cada operación, no se pierde nada aunque se cierre la pestaña.
 *  3) Al volver el internet: OfflineExcel.sincronizar(gasUrl) sube todo lo
 *     pendiente a Google Sheets vía GAS, en orden, marcando cada fila como sincronizada.
 */
window.OfflineExcel = (function () {
  const SHEET_PART = 'Participantes';
  const SHEET_RES = 'Resultados_Offline';
  const SHEET_PODIO = 'Podio_Offline';
  const SHEET_PUNT = 'Puntuaciones_Offline';
  const PART_COLS = ['id', 'nombre', 'robot', 'institucion', 'ciudad', 'categoria', 'correo', 'miembro2', 'aprobado'];
  const RES_COLS = ['participanteId', 'nombre', 'robot', 'institucion', 'categoria', 'tiempo', 'ronda', 'intento', 'ruta', 'fecha', 'sincronizado'];
  const PODIO_COLS = ['id_participante', 'correo', 'categoria', 'institucion', 'tipo_certificado', 'evento', 'nombre', 'nombre_completo', 'fecha', 'sincronizado'];
  const PUNT_COLS = ['id_participante', 'nombre', 'robot', 'institucion', 'categoria', 'juez_email', 'juez_nombre', 'criterios', 'notas', 'total', 'timestamp', 'sincronizado'];

  let fileHandle = null;
  let workbook = null;
  let activo = false;

  function soportado() {
    return typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function';
  }

  function safeParse(str, fallback) {
    try { return JSON.parse(str); } catch (e) { return fallback; }
  }

  function _tipoExcel() {
    return [{
      description: 'Excel',
      accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    }];
  }

  function _asegurarHojaResultados() {
    if (!workbook.Sheets[SHEET_RES]) {
      workbook.Sheets[SHEET_RES] = XLSX.utils.aoa_to_sheet([RES_COLS]);
      workbook.SheetNames.push(SHEET_RES);
    }
  }

  function _asegurarHojaPodio() {
    if (!workbook.Sheets[SHEET_PODIO]) {
      workbook.Sheets[SHEET_PODIO] = XLSX.utils.aoa_to_sheet([PODIO_COLS]);
      workbook.SheetNames.push(SHEET_PODIO);
    }
  }

  function _asegurarHojaPuntuaciones() {
    if (!workbook.Sheets[SHEET_PUNT]) {
      workbook.Sheets[SHEET_PUNT] = XLSX.utils.aoa_to_sheet([PUNT_COLS]);
      workbook.SheetNames.push(SHEET_PUNT);
    }
  }

  async function _guardarDisco() {
    if (!fileHandle || !workbook) return false;
    try {
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const writable = await fileHandle.createWritable();
      await writable.write(wbout);
      await writable.close();
      return true;
    } catch (e) {
      console.error('OfflineExcel: error escribiendo en disco', e);
      return false;
    }
  }

  // Crea un archivo .xlsx nuevo (usar la PRIMERA vez, con internet, antes del evento)
  async function crearNuevo(nombreSugerido) {
    if (!soportado()) { alert('El modo offline requiere Chrome o Edge (igual que el cronómetro Web Serial).'); return false; }
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: nombreSugerido || 'SucreBot_offline.xlsx',
        types: _tipoExcel()
      });
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([PART_COLS]), SHEET_PART);
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([RES_COLS]), SHEET_RES);
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([PODIO_COLS]), SHEET_PODIO);
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([PUNT_COLS]), SHEET_PUNT);
      activo = true;
      await _guardarDisco();
      return true;
    } catch (e) {
      console.error('OfflineExcel.crearNuevo:', e);
      return false;
    }
  }

  // Abre un archivo .xlsx existente (usar SIN internet, o para continuar donde quedó)
  async function activar() {
    if (!soportado()) { alert('El modo offline requiere Chrome o Edge (igual que el cronómetro Web Serial).'); return false; }
    try {
      const [handle] = await window.showOpenFilePicker({ types: _tipoExcel(), multiple: false });
      fileHandle = handle;
      const file = await handle.getFile();
      const buf = await file.arrayBuffer();
      workbook = XLSX.read(buf, { type: 'array' });
      if (!workbook.Sheets[SHEET_PART]) {
        workbook.Sheets[SHEET_PART] = XLSX.utils.aoa_to_sheet([PART_COLS]);
        workbook.SheetNames.push(SHEET_PART);
      }
      _asegurarHojaResultados();
      _asegurarHojaPodio();
      _asegurarHojaPuntuaciones();
      activo = true;
      await _guardarDisco();
      return true;
    } catch (e) {
      console.error('OfflineExcel.activar:', e);
      return false;
    }
  }

  // Con internet: llena/actualiza la hoja Participantes desde GAS (getParticipantes)
  async function importarParticipantesDesdeGAS(gasUrl, staffToken) {
    if (!activo) return false;
    const r = await fetch(gasUrl + '?' + new URLSearchParams({ action: 'getParticipantes', staffToken: staffToken || '' }));
    const todos = await r.json();
    const lista = Array.isArray(todos) ? todos : (todos.participantes || []);
    const rows = [PART_COLS];
    lista.forEach(p => rows.push([
      p.id || '', p.nombre || '', p.robot || '', p.institucion || '', p.ciudad || '',
      p.categoria || '', p.correo || '', p.miembro2 || '', p.aprobado || ''
    ]));
    workbook.Sheets[SHEET_PART] = XLSX.utils.aoa_to_sheet(rows);
    if (workbook.SheetNames.indexOf(SHEET_PART) === -1) workbook.SheetNames.push(SHEET_PART);
    await _guardarDisco();
    return lista.length;
  }

  function estaActivo() { return activo; }

  function getParticipantes(categoria) {
    if (!workbook || !workbook.Sheets[SHEET_PART]) return [];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PART], { defval: '' });
    return data.filter(p =>
      String(p.categoria || '').trim() === String(categoria || '').trim() &&
      String(p.aprobado || '').toUpperCase() === 'APROBADO'
    );
  }

  // Agrega un resultado y reescribe el archivo local inmediatamente
  async function guardarResultado(data) {
    if (!activo || !workbook) return false;
    _asegurarHojaResultados();
    const existing = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_RES], { defval: '' });
    existing.push({
      participanteId: data.participanteId || '',
      nombre: data.nombre || '',
      robot: data.robot || '',
      institucion: data.institucion || '',
      categoria: data.categoria || '',
      tiempo: data.tiempo,
      ronda: data.ronda,
      intento: data.intento,
      ruta: data.ruta || 'general',
      fecha: data.fecha || new Date().toISOString(),
      sincronizado: 'FALSE'
    });
    workbook.Sheets[SHEET_RES] = XLSX.utils.json_to_sheet(existing, { header: RES_COLS });
    return await _guardarDisco();
  }

  // Agrega N filas de podio (una por participante+tipo, incluye miembro2 si aplica)
  // filas: [{id_participante, correo, categoria, institucion, tipo_certificado, evento, nombre, nombre_completo}, ...]
  async function guardarPodio(filas) {
    if (!activo || !workbook) return false;
    _asegurarHojaPodio();
    const existing = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PODIO], { defval: '' });
    const ahora = new Date().toISOString();
    filas.forEach(f => existing.push({
      id_participante: f.id_participante || '',
      correo: f.correo || '',
      categoria: f.categoria || '',
      institucion: f.institucion || '',
      tipo_certificado: f.tipo_certificado || '',
      evento: f.evento || 'SucreBot 2026',
      nombre: f.nombre || '',
      nombre_completo: f.nombre_completo || '',
      fecha: ahora,
      sincronizado: 'FALSE'
    }));
    workbook.Sheets[SHEET_PODIO] = XLSX.utils.json_to_sheet(existing, { header: PODIO_COLS });
    return await _guardarDisco();
  }

  // Guarda una puntuación de juez (PANEL-CALIFICACION)
  async function guardarPuntuacion(data) {
    if (!activo || !workbook) return false;
    _asegurarHojaPuntuaciones();
    const existing = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PUNT], { defval: '' });
    existing.push({
      id_participante: data.id_participante || '',
      nombre: data.nombre || '',
      robot: data.robot || '',
      institucion: data.institucion || '',
      categoria: data.categoria || '',
      juez_email: data.juez_email || '',
      juez_nombre: data.juez_nombre || '',
      criterios: JSON.stringify(data.criterios || {}),
      notas: JSON.stringify(data.notas || {}),
      total: data.total,
      timestamp: data.timestamp || new Date().toISOString(),
      sincronizado: 'FALSE'
    });
    workbook.Sheets[SHEET_PUNT] = XLSX.utils.json_to_sheet(existing, { header: PUNT_COLS });
    return await _guardarDisco();
  }

  function contarPendientesPuntuaciones() {
    if (!workbook || !workbook.Sheets[SHEET_PUNT]) return 0;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PUNT], { defval: '' });
    return data.filter(r => String(r.sincronizado).toUpperCase() !== 'TRUE').length;
  }

  function contarPendientesPodio() {
    if (!workbook || !workbook.Sheets[SHEET_PODIO]) return 0;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PODIO], { defval: '' });
    return data.filter(r => String(r.sincronizado).toUpperCase() !== 'TRUE').length;
  }

  function contarPendientes() {
    if (!workbook) return 0;
    let total = 0;
    if (workbook.Sheets[SHEET_RES]) {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_RES], { defval: '' });
      total += data.filter(r => String(r.sincronizado).toUpperCase() !== 'TRUE').length;
    }
    total += contarPendientesPodio();
    total += contarPendientesPuntuaciones();
    return total;
  }

  // Con internet de vuelta: sube todo lo pendiente (resultados + podio) a GAS, en orden
  async function sincronizar(gasUrl, onProgress) {
    let ok = 0, fail = 0;
    // 1) Resultados (tiempos)
    if (workbook && workbook.Sheets[SHEET_RES]) {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_RES], { defval: '' });
      for (let i = 0; i < data.length; i++) {
        const r = data[i];
        if (String(r.sincronizado).toUpperCase() === 'TRUE') continue;
        try {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'pushResultado',
              participanteId: r.participanteId, nombre: r.nombre, robot: r.robot,
              institucion: r.institucion, tiempo: r.tiempo, ronda: r.ronda,
              intento: r.intento, ruta: r.ruta, fecha: r.fecha,
              staffToken: localStorage.getItem('sucrebot_staff_token') || ''
            })
          });
          r.sincronizado = 'TRUE';
          ok++;
        } catch (e) {
          fail++;
        }
        if (onProgress) onProgress(i + 1, data.length, 'resultados');
      }
      workbook.Sheets[SHEET_RES] = XLSX.utils.json_to_sheet(data, { header: RES_COLS });
    }
    // 2) Podio / certificados
    if (workbook && workbook.Sheets[SHEET_PODIO]) {
      const dataP = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PODIO], { defval: '' });
      for (let i = 0; i < dataP.length; i++) {
        const r = dataP[i];
        if (String(r.sincronizado).toUpperCase() === 'TRUE') continue;
        try {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'guardarCertificado',
              id_participante: r.id_participante, correo: r.correo, categoria: r.categoria,
              institucion: r.institucion, tipo_certificado: r.tipo_certificado,
              evento: r.evento, nombre: r.nombre, nombre_completo: r.nombre_completo,
              staffToken: localStorage.getItem('sucrebot_staff_token') || ''
            })
          });
          r.sincronizado = 'TRUE';
          ok++;
        } catch (e) {
          fail++;
        }
        if (onProgress) onProgress(i + 1, dataP.length, 'podio');
      }
      workbook.Sheets[SHEET_PODIO] = XLSX.utils.json_to_sheet(dataP, { header: PODIO_COLS });
    }
    // 3) Puntuaciones (calificación de jueces)
    if (workbook && workbook.Sheets[SHEET_PUNT]) {
      const dataQ = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PUNT], { defval: '' });
      for (let i = 0; i < dataQ.length; i++) {
        const r = dataQ[i];
        if (String(r.sincronizado).toUpperCase() === 'TRUE') continue;
        try {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'guardarPuntuacion',
              id_participante: r.id_participante, nombre: r.nombre, robot: r.robot,
              institucion: r.institucion, categoria: r.categoria,
              juez_email: r.juez_email, juez_nombre: r.juez_nombre,
              criterios: safeParse(r.criterios, {}), notas: safeParse(r.notas, {}),
              total: r.total, timestamp: r.timestamp,
              staffToken: localStorage.getItem('sucrebot_staff_token') || ''
            })
          });
          r.sincronizado = 'TRUE';
          ok++;
        } catch (e) {
          fail++;
        }
        if (onProgress) onProgress(i + 1, dataQ.length, 'puntuaciones');
      }
      workbook.Sheets[SHEET_PUNT] = XLSX.utils.json_to_sheet(dataQ, { header: PUNT_COLS });
    }
    await _guardarDisco();
    return { ok, fail };
  }

  function desactivar() {
    activo = false;
    fileHandle = null;
    workbook = null;
  }

  return {
    soportado, crearNuevo, activar, importarParticipantesDesdeGAS,
    estaActivo, getParticipantes, guardarResultado, contarPendientes,
    guardarPodio, contarPendientesPodio,
    guardarPuntuacion, contarPendientesPuntuaciones,
    sincronizar, desactivar
  };
})();
